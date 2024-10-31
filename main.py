import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse

from backend.api import api_router
from backend.config.server import HOST_URL, HOST_PORT

app = FastAPI()
app.mount("/frontend", StaticFiles(directory="./frontend"), name="frontend")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
async def redirect_to_user_index():
    return RedirectResponse(url="/frontend/index/index.html")


# 包含 API 路由
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=HOST_URL, port=HOST_PORT)
