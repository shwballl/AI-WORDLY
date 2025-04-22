from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import logging

from .ai import generate_word

from .logging import configure_logging, LogLevels


configure_logging(LogLevels.info)

app = FastAPI()

#Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WordLengthRequest(BaseModel):
    length: int

@app.post('/generate_word')
async def generate(req: WordLengthRequest) -> str:
    """Generate a random word of a given length.

    Args:
        req (WordLengthRequest): A request containing the length of the word to generate.

    Returns:
        str: The generated word, or a JSON object containing an "error" key.
    """
    length = req.length
    if length is None:
        logging.error("Length is None")
        return {"error": "Length is None"}

    logging.info("Length: " + str(length))
    response = generate_word(length)

    if not response:
        logging.error("Response is None")
        return {"error": "Response is None"}

    return str(response)
