from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import run_agent

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
def ask():
    question = request.json["question"]
    steps = run_agent(question)
    return jsonify(steps)