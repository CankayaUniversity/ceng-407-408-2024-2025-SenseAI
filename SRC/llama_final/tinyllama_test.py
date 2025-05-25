import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, DataCollatorForLanguageModeling, StoppingCriteria, StoppingCriteriaList, TextStreamer
from datasets import load_dataset, Dataset

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Loading fine-tuned model
model_path = "./tinyllama-chat-finetuned-aug-more-nolora/checkpoint-1107"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)
model.to(device)
model.eval()

def truncate_result(text):
    endpos = text.find('### Response')
    if endpos > -1:
        return text[:endpos]
    sentence_enders = ['.', '?', '!']
    indices = []

    for ender in sentence_enders:
        index = text.find(ender)
        while index != -1:
            indices.append(index)
            index = text.find(ender, index + 1)

    if not indices:
        return text  # No sentence enders found

    indices.sort()  # Sort the indices in ascending order

    if len(indices) >= 3:
        return text[:indices[2] + 1]  # Return up to and including the third occurrence
    if len(indices) >= 2:
        return text[:indices[1] + 1]  # Return up to and including the second occurrence
    else:
        return text[:indices[0] + 1]

def chat(prompt: str, max_new_tokens=50):
    full_prompt = f"### Instruction:\n{prompt}\n### Response:\n"
    inputs = tokenizer(full_prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=0.65,
        top_p=0.95,
        eos_token_id=tokenizer.eos_token_id,
    )
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return truncate_result(response.split("<|assistant|>")[-1].strip()).strip()

print(chat("Emotion: sad.My dog died today."))