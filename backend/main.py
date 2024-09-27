from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import RedirectResponse
from api import api_router  # 导入 API 路由
from database import Database
from contextlib import asynccontextmanager

app = FastAPI()
app.mount("/frontend", StaticFiles(directory="../frontend"), name="frontend")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

db = Database()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()


app.dependency_overrides[db] = lifespan


@app.get("/")
async def redirect_to_user_index():
    return RedirectResponse(url="/frontend/index/index.html")


# 包含 API 路由
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=11345)
