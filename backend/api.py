from fastapi import APIRouter
from fastapi.params import Body
from fastapi.responses import StreamingResponse
from models import ModelRequest, ChatRequest
import httpx

api_router = APIRouter(prefix="/api")

BASE_URL = "http://221.180.141.96:11434/api"


@api_router.post("/generate")
async def stop_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        print(f"{BASE_URL}/generate", payload)
        response = await client.post(f"{BASE_URL}/generate", json=payload)
        return response.json()


@api_router.post("/show")
async def show_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/show", json=payload)
        return response.json()


@api_router.get("/ps")
async def list_running_models():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/ps")
        return response.json()


@api_router.get("/tags")
async def get_tags():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/tags")
        return response.json()


@api_router.delete("/delete")
async def delete_model(name: str):
    payload = {"name": name}
    async with httpx.AsyncClient() as client:
        response = await client.delete(f"{BASE_URL}/delete", json=payload)
        return response.json()


@api_router.post("/pull")
async def pull_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/pull", json=payload)
        return response.json()


@api_router.post("/embed")
async def generate_embedding(payload: dict = Body(..., description="模型名称")):
    # payload = {"model": model, "input": input}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/embed", json=payload)
        return response.json()


@api_router.post("/chat")
async def chat(request: ChatRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{BASE_URL}/chat", json=request.dict())
        return response.json()
