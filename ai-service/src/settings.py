from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from models import Base
from urllib.parse import quote_plus
from pgvector.psycopg import register_vector_async
from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()

HOST = os.environ.get("DB_HOST")
USERNAME = os.environ.get("DB_USERNAME")
PASSWORD = quote_plus(os.environ.get("DB_PASSWORD", ""))
DATABASE = os.environ.get("DB_DATABASE_NAME")
PORT = os.environ.get("DB_PORT")


DROP_ALL_TABLES = os.environ.get("DROP_ALL_TABLES", "").lower() == "true"


URL_DATABASE = f'postgresql+psycopg://{USERNAME}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}'

engine = create_async_engine(URL_DATABASE, echo=True)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def init_db():
    async with engine.begin() as conn:
        print("CREATING VECTOR EXTENSION===================================")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(lambda sync_conn: register_vector_async(sync_conn))

        if DROP_ALL_TABLES:
            await conn.run_sync(Base.metadata.drop_all)

        await conn.run_sync(Base.metadata.create_all)

        

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session