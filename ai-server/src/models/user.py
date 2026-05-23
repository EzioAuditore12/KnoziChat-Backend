# from sqlalchemy import UUID, String
from uuid import UUID, uuid4
from ._base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing_extensions import List
from pydantic import BaseModel
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .group import Group
    

# class UserBase(BaseModel):
#     question_text: str
#     choices: List["ChoiceBase"]
    

class User(Base):
    __tablename__ = 'user'
    
    id: Mapped[UUID] = mapped_column(primary_key=True, index=True, default=uuid4)
    username: Mapped[str] = mapped_column(index=True, nullable=False)
    
    groups: Mapped[List["Group"]] = relationship(
        back_populates="user", lazy="selectin" # Effective for one-to-many for async operations
        # "joined" good for many-to-one or one-to-one
    )
    
    