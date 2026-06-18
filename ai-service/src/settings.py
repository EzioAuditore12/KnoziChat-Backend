from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from models import Base
from pgvector.psycopg import register_vector_async
from sqlalchemy import text

from env import DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE_NAME, DB_PORT, DROP_ALL_TABLES

URL_DATABASE = f'postgresql+psycopg://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE_NAME}'


engine = create_async_engine(URL_DATABASE, echo=True)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def init_db():
    async with engine.begin() as conn:
        print("CREATING VECTOR EXTENSION===================================")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        
        raw_conn = await conn.get_raw_connection()
        await register_vector_async(raw_conn.driver_connection)

        if DROP_ALL_TABLES:
            await conn.run_sync(Base.metadata.drop_all)

        await conn.run_sync(Base.metadata.create_all)

        

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session