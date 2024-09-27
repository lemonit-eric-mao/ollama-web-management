from pydantic import BaseModel
from typing import List, Optional


class Service(BaseModel):
    name: str


class ServiceIn(BaseModel):
    name: str


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: List[Message]


class ModelRequest(BaseModel):
    model: str
    stream: Optional[bool] = False
    options: Optional[dict] = None
    keep_alive: Optional[int] = None
