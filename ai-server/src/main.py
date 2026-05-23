"""
This is a Windows-specific issue with psycopg and asyncio, asyncio uses ProactorEventLoop by default, which psycopg doesn't support in windows. So we need to use the SelectorEventLoop.

Hence don't forgot to use "--reload" flag with uvicorn, or


# import asyncio
# from asyncio import WindowsSelectorEventLoopPolicy
# import sys

# if sys.platform == "win32":
#     print("Before: ", asyncio.get_event_loop_policy())
#     asyncio.set_event_loop_policy(WindowsSelectorEventLoopPolicy())
#     print("After: ", asyncio.get_event_loop_policy())
#     # The above import statements are window specific, might not be needed in linux server
"""


from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Annotated
from settings import engine, init_db, get_session
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from models import User, Group, ChatTranscript, Base
from sqlalchemy import delete, select
from schemas import QueryProcessRequestSchema
from utils import HandleParsing, HandleLLM



@asynccontextmanager
async def life_span(app: FastAPI):
    await init_db()
    
    async with engine.begin() as conn:
        yield # remove when un-commenting below code
    
    # async with AsyncSession(bind=engine) as session:
    #     # Add question in table for now
    #     q1 = Question(question_text="What is Earth?")
    #     q2 = Question(question_text="What is Mars?")
    #     q3 = Question(question_text="What is Jupiter?")
        
    #     session.add_all([q1, q2, q3])
    #     await session.flush()
        
    #     c21 = Choice(question=q2, choice_text="planet", is_correct=True)
    #     c22 = Choice(question=q2, choice_text="burger", is_correct=False)
        
    #     session.add_all([c21, c22])
    #     await session.commit()
    
    #     yield
        
    #     # removing them now
    #     async with AsyncSession(bind=engine) as session:
    #         await session.execute(delete(Choice))
    #         await session.flush()
    #         await session.execute(delete(Question))
    #         await session.commit()
            
            
    


app = FastAPI(lifespan=life_span)




@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q} 


# @app.get("/questions/")
# async def list_questions(
#     session: AsyncSession = Depends(get_session),
# ):
#     result = await session.execute(select(Question))
#     print("Result: ", result)
    
#     questions = result.scalars().all()
#     print("Questions: ", questions)
    
#     return questions


@app.post("/send")
async def process_query(request_body: QueryProcessRequestSchema):
    try:
        
        if request_body.chats:
        
            setup_completed = await HandleParsing(
                user_details=request_body.user,
                group_details=request_body.group,
                chats=request_body.chats,
            ).setup()
            
            if not setup_completed:
                raise HTTPException(500, {
                    "error": "Something went wrong while saving chats...",
                })
                
            llm_handle = HandleLLM(
                user_id=str(request_body.user.user_id),
                group_id=request_body.group.group_id,
                query=request_body.query,
            )
            
            response = await llm_handle.resolve_query()
            
            return {
                "response": response,
            }
            
            
            
            # return StreamingResponse(
            #     llm_handle.generate_response(),
            #     media_type="text/event-stream"
            # )


    except Exception as e:
        raise HTTPException(500, e)