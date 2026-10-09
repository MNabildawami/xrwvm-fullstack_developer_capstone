
import os
import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv(
    'backend_url',
    default="http://localhost:3030"
)

sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/"
)


def get_request(endpoint, **kwargs):
    """Send GET requests to the Express backend."""
    request_url = backend_url + endpoint
    response = requests.get(request_url, params=kwargs, timeout=10)
    return response.json()


# Will be implemented in the next step.
def analyze_review_sentiments(text):
    pass


def post_review(data_dict):
    pass
