from sqlalchemy import ForeignKey, DateTime, ARRAY, Index, String, Text
from ._base import Base
from sqlalchemy.orm import mapped_column, relationship, Mapped
from pgvector.sqlalchemy import Vector
import numpy as np

from pydantic import BaseModel
from typing import TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .group import Group
    
    
    
class ChatTranscript(Base):
    __tablename__ = 'chat-transcript'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sent_by_users: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    
    chats_set_transcript: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[np.ndarray] = mapped_column(Vector(768))
    
    start_time_stamp: Mapped[datetime] = mapped_column(DateTime())
    end_time_stamp: Mapped[datetime] = mapped_column(DateTime())
    
    group_id: Mapped[int] = mapped_column(ForeignKey("group.id"))
    
    group: Mapped["Group"] = relationship(back_populates='chat_transcripts')
    
    # Will add it if required
    # __table_args__ = (
    #     Index('hnsw_index_for_chat_embedding',
    #           'embedding',
    #           postgresql_using='hnsw',
    #           postgresql_with={'m': 16, 'ef_construction': 64},
    #           postgresql_ops={'embedding': 'vector_cosine_ops'}
    #     ),
    # )
    
    