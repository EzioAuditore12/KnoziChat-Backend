from sqlalchemy import String, BigInteger
from ._base import Base
from sqlalchemy.orm import mapped_column, relationship, Mapped
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from .chat import ChatTranscript
    

# class GroupBase(BaseModel):
#     choice_text: str
#     is_correct: bool
    
    
class Conversation(Base):
    __tablename__ = 'conversation'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    conversation_id_client: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True, unique=True)
    
    conversation_name: Mapped[str] = mapped_column(String(40))
    
    chat_transcripts: Mapped[List["ChatTranscript"]] = relationship(back_populates='conversation', lazy="selectin")
    
    