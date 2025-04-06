from transformers import AutoModelForCausalLM, AutoTokenizer

# Modeli ve tokenizer'ı yükle
model = AutoModelForCausalLM.from_pretrained("./llama_model")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")

# Kullanıcı girdisi al
user_input = input("Soru sor: ")

# Modeli çalıştır
inputs = tokenizer(f"Soru: {user_input} \nCevap:", return_tensors="pt")
output = model.generate(**inputs, max_length=256)
response = tokenizer.decode(output[0], skip_special_tokens=True)

print(f"SenseAI'nin cevabı: {response}")
