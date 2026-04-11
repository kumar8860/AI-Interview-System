from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_models.model import predict_answer

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Backend running successfully"

@app.route('/interview', methods=['POST'])
def interview():
    data = request.get_json()
    question = data.get("question")

    response = predict_answer(question)

    return jsonify({"answer": response})

if __name__ == '__main__':
    app.run(debug=True)