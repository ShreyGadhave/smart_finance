from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

# Load FinBERT
MODEL_NAME = "ProsusAI/finbert"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

labels = ["negative", "neutral", "positive"]


def get_sentiment(text):
    if not text or len(text.strip()) < 10:
        return {
            "label": "neutral",
            "confidence": 0.0,
            "scores": {
                "negative": 0.0,
                "neutral": 1.0,
                "positive": 0.0
            }
        }

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

    with torch.no_grad():
        outputs = model(**inputs)

    probs = F.softmax(outputs.logits, dim=1)[0]

    score_dict = {
        "negative": probs[0].item(),
        "neutral": probs[1].item(),
        "positive": probs[2].item()
    }

    label = max(score_dict, key=score_dict.get)

    return {
        "label": label,
        "confidence": score_dict[label],
        "scores": score_dict
    }