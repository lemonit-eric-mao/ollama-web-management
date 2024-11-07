import asyncio
import json
from http.client import HTTPException
from typing import List, AsyncIterable

import httpx
from fastapi import APIRouter
from fastapi.params import Body
from sse_starlette import EventSourceResponse
from starlette.responses import StreamingResponse

from backend.chat import ChatServer
from backend.config.server import set_ollama_url, get_ollama_url

api_router = APIRouter(prefix="/api")

chat_model = ChatServer()


@api_router.post("/generate")
async def generate_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{get_ollama_url()}/api/generate", json=payload)
            return response.json()
        except Exception as e:
            # 捕获其他类型的异常
            print(f"An error occurred: {str(e)}")
            raise HTTPException()


@api_router.post("/show")
async def show_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{get_ollama_url()}/api/show", json=payload)
        return response.json()


@api_router.get("/ps")
async def list_running_models():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{get_ollama_url()}/api/ps")
        return response.json()


@api_router.get("/tags")
async def get_tags():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{get_ollama_url()}/api/tags")
        return response.json()


@api_router.post("/chat/completions")
async def chat(question: str = Body(..., description="用户输入", examples=["简述，你是谁？"]),
               history: List[dict] = Body([], description="历史对话列表"),
               stream: bool = Body(True, description="流式输出"),
               model: str = Body(..., description="LLM 模型名称"),
               temperature: float = Body(0.01, description="LLM 采样温度", ge=0.0, le=1.0),
               ):
    # 调用ChatServer的chat方法
    async def chat_iterator() -> AsyncIterable[str]:

        # 调用ChatServer的chat方法
        response = chat_model.chat(
            question,
            history,
            model=model,
            temperature=temperature,
            stream=stream
        )

        # 判断是否流式输出
        # 返回流式响应
        if stream:
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield json.dumps({"text": content}, ensure_ascii=False)
                    await asyncio.sleep(0)
        else:
            yield json.dumps({"text": response}, ensure_ascii=False)

    return EventSourceResponse(chat_iterator())


@api_router.delete("/delete")
async def delete_model(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        try:
            # 使用 request 方法发送 DELETE 请求
            response = await client.request("DELETE", f"{get_ollama_url()}/api/delete", headers={'Content-Type': 'application/json'}, json=payload)
            response.raise_for_status()
            return True
        except Exception as e:
            # 捕获其他类型的异常
            print(f"An error occurred: {str(e)}")
            raise HTTPException()


@api_router.post("/pull")
async def pull_model(payload: dict = Body(..., description="模型名称")):
    async def stream_response():
        async with httpx.AsyncClient(timeout=None) as client:  # 设置永不超时
            async with client.stream("POST", f"{get_ollama_url()}/api/pull", json=payload) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream_response(), media_type="application/json")


@api_router.post("/embed")
async def generate_embedding(payload: dict = Body(..., description="模型名称")):
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{get_ollama_url()}/api/embed", json=payload)
        return response.json()


@api_router.post("/create")
async def pull_model(payload: dict = Body(..., description="模型名称")):
    async def stream_response():
        async with httpx.AsyncClient(timeout=None) as client:  # 设置永不超时
            async with client.stream("POST", f"{get_ollama_url()}/api/create", json=payload) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream_response(), media_type="application/json")


@api_router.post("/updateServerAddress")
def generate_model(payload: dict = Body(..., description="服务端地址")):
    try:
        set_ollama_url(payload.get('server_address'))
    except Exception as e:
        # 捕获其他类型的异常
        print(f"An error occurred: {str(e)}")
        raise HTTPException()
