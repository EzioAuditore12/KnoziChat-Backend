from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from models import Base
from urllib.parse import quote_plus
from pgvector.psycopg import register_vector_async
from sqlalchemy import text


USERNAME = 'postgres'
PASSWORD = quote_plus('Dp@20080139')
DATABASE = 'knozichat-ai-db'

URL_DATABASE = f'postgresql+psycopg://{USERNAME}:{PASSWORD}@localhost:5432/{DATABASE}'

engine = create_async_engine(URL_DATABASE, echo=True)

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def init_db():
    async with engine.begin() as conn:
        print("CREATING VECTOR EXTENSION===================================")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(lambda sync_conn: register_vector_async(sync_conn))
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Base.metadata.create_all(conn) # this is synchronous so we aren't dealing with this
        await conn.run_sync(Base.metadata.create_all)

        

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session