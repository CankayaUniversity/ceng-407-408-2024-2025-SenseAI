# ceng-407-408-2024-2025-SenseAI


# SenseAI - Multimodal Emotion Analysis Chatbot

SenseAI is a multimodal AI system that analyzes human emotions using facial expressions, voice tone, text inputs, and biometric data (e.g., heart rate). It generates psychologically supportive responses through a fine-tuned LLaMA model trained on therapy-style dialogues.

---
## Installation
### 1. Clone the repository or extract the zip file:

```bash
unzip senseai_v1.0.0.zip
cd senseai_project
```

---

###  2. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
source venv\Scripts\activate
```

---

###  3. Install dependencies:

```bash
pip install -r requirements.txt
```

---

## How to Train & Test

```bash
python llama3_2.py
```

Make sure `llama_data_prompt.jsonl` is in the same directory and the model outputs will be saved or loaded from `llama_model/`.

---

## Trained Model

The trained LLaMA model is included in the `llama_model/` directory.

---

## Dataset Info

The dataset `llama_data_prompt.jsonl` includes emotionally labeled text samples in the format:

```json
{
  "input": "Emotion: anger.I’m so mad at the world right now.",
"output": "It’s understandable to feel angry when everything feels wrong. What do you think is contributing to this anger about the world?"
}
```

---

## Server (API Layer)

Go to the `backend/` directory and follow its instructions:

```bash
cd backend
pip install -r requirements.txt
node server.js
```

---

## Flutter App

Navigate to the `flutter/` directory and run:

```bash
flutter run
```

---
## Included Components

Fine-tuned LLaMA model code (training & testing)

Emotion-labeled psychological dialogue dataset

DeepFace for facial expression analysis

Voice tone analysis

API Server (Node.js)

Basic Flutter UI

## Known Issues

Biometrics integration is experimental.

Real-time fusion of modalities will be improved in upcoming versions.

UI is minimal and not yet production-ready.

---

| Team Members            | Department    | Student Number  |
| ----------------------- | ------------- | --------------- |
| Ece Heval Ünal          | CENG          | 202111014       |
| Mustafa Tozman          | SENG          | 202128014       |
| Özge Alkan              | SENG          | 202128406       |
| Sadrettin Anıl Karaçay  | CENG          | 202011046       |
| Zeliha Aybüke Baştürk   | SENG          | 202028034       |


### Advisors
- Atila Bostan
* İsmail Bora Çelikkale

### Project Website
* [website](https://unaleceheval.wixsite.com/senseai)

