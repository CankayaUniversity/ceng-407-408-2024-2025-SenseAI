import torch
from transformers import AutoModelForCausalLM, Trainer, TrainingArguments
from transformers.tokenization_utils_base import BatchEncoding

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

torch.serialization.add_safe_globals([BatchEncoding])
tokenized_data = torch.load("tokenized_data.pt", weights_only=False)

training_args = TrainingArguments(
    output_dir="./trained_model",
    per_device_train_batch_size=1,
    num_train_epochs=3,
    save_strategy="epoch",
    logging_dir="./logs"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_data
)

trainer.train()
model.save_pretrained("./trained_model")
print("Model eğitildi ve './trained_model' dizinine kaydedildi!")
