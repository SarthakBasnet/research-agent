import requests
import os
def calculator(expression: str) -> str:
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return str(result)
    except Exception as e:
        return f"Error: {e}"

def web_search(query: str) -> str:
    api_key = os.environ["TAVILY_API_KEY"]
    response = requests.post(
        "https://api.tavily.com/search",
        json={
            "api_key": api_key,
            "query": query,
            "max_results": 3
        }
    )
    data = response.json()
    results = data.get("results", [])

    if not results:
        return "No results found."

    summary = ""
    for r in results:
        summary += f"- {r['title']}: {r['content'][:200]}\n"

    return summary