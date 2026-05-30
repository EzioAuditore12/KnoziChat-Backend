from sqlalchemy import String, ForeignKey, BigInteger
from ._base import Base
from sqlalchemy.orm import mapped_column, relationship, Mapped
from typing import TYPE_CHECKING, List
from uuid import UUID

if TYPE_CHECKING:
    from .user import User
    from .chat import ChatTranscript
    

# class GroupBase(BaseModel):
#     choice_text: str
#     is_correct: bool
    
    
class Group(Base):
    __tablename__ = 'group'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    g_id_client: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    
    group_name: Mapped[str] = mapped_column(String(40))
    
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    
    user: Mapped["User"] = relationship(back_populates='groups')
    chat_transcripts: Mapped[List["ChatTranscript"]] = relationship(back_populates='group', lazy="selectin")
    
    