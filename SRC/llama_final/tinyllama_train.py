import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling, StoppingCriteria, StoppingCriteriaList, TextStreamer
from datasets import load_dataset, Dataset

print('Loading pre-trained model...')
model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
jsonl_path = "./llama_data_promt_aug_more.jsonl"
tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
model = AutoModelForCausalLM.from_pretrained(model_id)

def load_jsonl(file_path):
    with open(file_path, 'r') as f:
        data = [eval(line) for line in f]

    texts = [f"### Instruction:\n{ex['input']}\n\n### Response:\n{ex['output']}" for ex in data]
    return Dataset.from_dict({"text": texts})

# Tokenization 
def tokenize(example):
    result = tokenizer(
        example["text"],
        padding="max_length",
        truncation=True,
        max_length=512,
        return_tensors="pt"
    )
    result["labels"] = result["input_ids"]
    return result

print("Preraring Data...")
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token
dataset = load_jsonl(jsonl_path).shuffle().train_test_split(test_size=1) # use only 1 element for test, change test_size to 0.2 for 20% test split
tokenized_dataset = dataset.map(tokenize, batched=True)

training_args = TrainingArguments(
    output_dir="./tinyllama-chat-finetuned-augmore",
    per_device_train_batch_size=8,
    gradient_accumulation_steps=2,      # effectively batch size 16
    save_strategy="epoch",
    # eval_strategy="epoch",
    eval_strategy="no",
    logging_strategy="epoch",
    num_train_epochs=100,
    warmup_steps=100,
    learning_rate=2e-5,
    fp16=True,                           # AMP (Automatic Mixed Precision)
    bf16=False,                          # Set to True only if on A100
    optim="paged_adamw_8bit",           # Memory-efficient optimizer
    lr_scheduler_type="cosine",
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    tokenizer=tokenizer,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    data_collator=DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False),
)

print('Training...')
trainer.train()