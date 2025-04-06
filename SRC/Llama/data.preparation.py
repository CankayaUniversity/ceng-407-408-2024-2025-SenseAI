import json
import torch
from transformers import AutoTokenizer

# Tokenizer'ı yükle
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")

# Eğer pad_token tanımlanmadıysa, eos_token'ı pad_token olarak kullanıyoruz.
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# Veri setini yükle
with open("psychology_dialogues.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Tokenizasyon fonksiyonu
def tokenize_data(data):
    tokenized_data = []
    for entry in data:
        text = f"Soru: {entry['user_input']} \nCevap: {entry['bot_response']}"
        # Tokenizasyon işlemi
        tokens = tokenizer(text, padding="max_length", truncation=True, max_length=256, return_tensors="pt")
        tokenized_data.append(tokens)
    return tokenized_data

# Tokenize edilmiş veriyi kaydet
tokenized_data = tokenize_data(data)

# Tokenize edilmiş veriyi .pt dosyasına kaydet
torch.save(tokenized_data, "tokenized_data.pt")

print("Tokenizasyon tamamlandı ve 'tokenized_data.pt' olarak kaydedildi!")
