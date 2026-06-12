from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing_extensions import Optional

class ChatSchema(BaseModel):
    username: str
    message: str
    created_at: datetime


from pydantic import Field



class ConversationSchema(BaseModel):
    conversation_id: int
    conversation_name: str
    

class QueryProcessRequestSchema(BaseModel):
    conversation: ConversationSchema
    chats: Optional[list[ChatSchema]]
    query: str
    
    