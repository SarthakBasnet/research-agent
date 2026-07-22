import os
from dotenv import load_dotenv
from google import genai
from tools import calculator, web_search

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

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

web_search_tool = {
    "name": "web_search",
    "description": "Searches the web for current information and returns a summary of top results.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The search query, e.g. 'who won the 2026 FIFA World Cup'"
            }
        },
        "required": ["query"]
    }
}

question = "Who won the 2026 FIFA World Cup, and who scored the winning goal?"

messages = [
    {"role": "user", "parts": [{"text": question}]}
]

while True:
    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=messages,
        config={
            "tools": [{"function_declarations": [calculator_tool, web_search_tool]}]
        }
    )

    part = response.candidates[0].content.parts[0]

    if part.function_call:
        tool_name = part.function_call.name
        tool_args = part.function_call.args
        print(f"Gemini wants to call: {tool_name} with {tool_args}")

        if tool_name == "calculator":
            result = calculator(tool_args["expression"])
        elif tool_name == "web_search":
            result = web_search(tool_args["query"])
        else:
            result = "Error: unknown tool"

        print(f"Tool result: {result}")

        messages.append({"role": "model", "parts": [part]})
        messages.append({
            "role": "user",
            "parts": [{
                "function_response": {
                    "name": tool_name,
                    "response": {"result": result}
                }
            }]
        })

    else:
        print("Final answer:", response.text)
        break