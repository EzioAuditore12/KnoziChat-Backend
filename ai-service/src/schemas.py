from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing_extensions import Optional

class ChatSchema(BaseModel):
    username: str
    message: str
    created_at: datetime


from pydantic import Field

class BaseUserSchema(BaseModel):
    user_id: UUID = Field(alias="id")
    username: str

    class Config:
        from_attributes = True
        populate_by_name = True  

class BaseGroupSchema(BaseModel):
    group_id: int
    group_name: str
    

class QueryProcessRequestSchema(BaseModel):
    group: BaseGroupSchema
    chats: Optional[list[ChatSchema]]
    query: str
    
    