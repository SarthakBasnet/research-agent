import os
import json
from dotenv import load_dotenv
from google import genai
from tools import calculator, web_search, fetch_page

import socket

_original_getaddrinfo = socket.getaddrinfo

def _ipv4_only_getaddrinfo(*args, **kwargs):
    return [
        info for info in _original_getaddrinfo(*args, **kwargs)
        if info[0] == socket.AF_INET
    ]

socket.getaddrinfo = _ipv4_only_getaddrinfo

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

fetch_page_tool = {
    "name": "fetch_page",
    "description": "Fetches and returns the text content of a specific web page URL.",
    "parameters": {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "The full URL of the page to fetch, e.g. 'https://example.com/article'"
            }
        },
        "required": ["url"]
    }
}


def run_agent(question):
    messages = [
        {"role": "user", "parts": [{"text": question}]}
    ]

    while True:
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=messages,
            config={
                "tools": [{"function_declarations": [calculator_tool, web_search_tool, fetch_page_tool]}]
            }
        )

        part = response.candidates[0].content.parts[0]

        if part.function_call:
            tool_name = part.function_call.name
            tool_args = part.function_call.args

            if tool_name == "calculator":
                result = calculator(tool_args["expression"])
                result_for_gemini = result
            elif tool_name == "web_search":
                result = web_search(tool_args["query"])
                result_for_gemini = json.dumps(result)
            elif tool_name == "fetch_page":
                result = fetch_page(tool_args["url"])
                result_for_gemini = result
            else:
                result = "Error: unknown tool"
                result_for_gemini = result

            yield {
                "type": "tool_call",
                "tool": tool_name,
                "args": dict(tool_args),
                "result": result
            }

            messages.append({"role": "model", "parts": [part]})
            messages.append({
                "role": "user",
                "parts": [{
                    "function_response": {
                        "name": tool_name,
                        "response": {"result": result_for_gemini}
                    }
                }]
            })

        else:
            yield {
                "type": "final_answer",
                "text": response.text
            }
            return