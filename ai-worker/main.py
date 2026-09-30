from fastapi import FastAPI
from pydantic import BaseModel
from fetch_text import fetch_text
from res import classify_domain

app = FastAPI()

class DomainRequest(BaseModel):
    domain: str

@app.get("/")
def work():
    return{"message" : "ai-worker is running"}

@app.post("/work")
def check_domain(request: DomainRequest):

    decision = classify_domain(request.domain)

    return decision

