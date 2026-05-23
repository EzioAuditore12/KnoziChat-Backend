from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing_extensions import Optional, TypedDict

class ChatSchema(BaseModel):
    username: str
    message: str
    created_at: datetime


class BaseUserSchema(BaseModel):
    user_id: UUID
    username: str


class BaseGroupSchema(BaseModel):
    group_id: int
    group_name: str
    

class QueryProcessRequestSchema(BaseModel):
    user: BaseUserSchema
    group: BaseGroupSchema
    chats: Optional[list[ChatSchema]]
    query: str
    
    



