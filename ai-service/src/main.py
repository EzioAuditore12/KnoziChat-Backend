from fastapi import FastAPI
from settings import engine, init_db
from contextlib import asynccontextmanager
from routes import router

@asynccontextmanager
async def life_span(app: FastAPI):
    await init_db()
    
    async with engine.begin() as conn:
        yield
            
app = FastAPI(
    lifespan=life_span,
    title="AI powered Group Chats summarizer"
)

app.include_router(router)

