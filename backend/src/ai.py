from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage, AssistantMessage
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
import os
import logging

load_dotenv()

endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4.1"
token = os.getenv("GITHUB_API_KEY")

client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

messages=[
    SystemMessage("You will only create one random word, he will be the length that I will write to you further, it will only be a number. Write me only one word, all with lowercase letters."),
]


def generate_word(length_of_word: int) -> str:
    """Generate a random word of a given length using the GitHub AI model.

    The model is given the length of the word as a single number, and it should
    generate a single word of that length. The word should be all lowercase.

    Args:
        length_of_word (int): The length of the word to generate.

    Returns:
        str: The generated word, or None if generation fails.
    """
    messages.append(
       UserMessage("Word length: " + str(length_of_word)),
    )
    try:
        response = client.complete(
            messages=messages,
            max_tokens=128,
            model=model,
            temperature=0.4,
            top_p=1
        )
    except Exception as e:
        logging.error("Failed to generate word. With error: " + str(e))
        return None
    
    logging.info("AI response content: " + str(response.choices))
    ai_word = response.choices[0].message.content
    logging.info("Word successfuly generated: " + str(ai_word))
    
    messages.append(
        AssistantMessage(ai_word),
    )
    return ai_word