import os
from dotenv import load_dotenv
from google import genai
from tools import calculator

calculator_tool = {
    "name": "calculator",
    "description": "Evaluates a basic math expression and returns the result.",
    "parameters": {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "A math expression to evaluate, e.g. '2 + 2'"
            }
        },
        "required": ["expression"]
    }
}

load_dotenv()

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_content(
    model="gemini-flash-latest",
    contents="What is 847 * 293?",
    config={
        "tools": [{"function_declarations": [calculator_tool]}]
    }
)

part = response.candidates[0].content.parts[0]

if part.function_call:
    tool_name = part.function_call.name
    tool_args = part.function_call.args
    print(f"Gemini wants to call: {tool_name} with {tool_args}")

    if tool_name == "calculator":
        result = calculator(tool_args["expression"])
        print(f"Tool result: {result}")

        follow_up = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[
                {"role": "user", "parts": [{"text": "What is 847 * 293?"}]},
                {"role": "model", "parts": [part]},
                {"role": "user", "parts": [{
                    "function_response": {
                        "name": tool_name,
                        "response": {"result": result}
                    }
                }]}
            ],
            config={
                "tools": [{"function_declarations": [calculator_tool]}]
            }
        )

        print(follow_up.text)