from transformers import pipeline

generator = pipeline("text-generation", model="distilgpt2")

def predict_answer(question):
    try:
        result = generator(question, max_length=50, num_return_sequences=1)
        return result[0]['generated_text']
    except Exception as e:
        return "Error: " + str(e)