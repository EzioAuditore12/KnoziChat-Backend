from schemas import ChatSchema
from models import User, Group, ChatTranscript
from dotenv import load_dotenv
import os
from sqlalchemy import insert, select
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from settings import engine
from datetime import timedelta, datetime
from pydantic import BaseModel
from typing import Optional
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from schemas import BaseUserSchema, BaseGroupSchema
from .extras import async_timer



load_dotenv()
GEMINI_API_KEY=os.environ.get("GEMINI_API_KEY")

'''
(chat_set TYPE)
[10:01 AM] Alice: Hey
[10:01 AM] Bob: Hi
[10:02 AM] Alice: Did you restart PM2 on the EC2 instance?
[10:03 AM] Bob: Yeah
'''

class ChatChunkSchema(BaseModel):
    chats_set: str
    sent_by_users: list[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]


class HandleParsing:
    def __init__(
        self, 
        user_details: BaseUserSchema,
        group_details: BaseGroupSchema, 
        chats: list[ChatSchema]
    ) -> None:
        
        self.user_details = user_details
        self.group_details = group_details
        self.chats = chats
        
        self.MAX_TIME_GAP_MINUTES = 5
        

        
    @async_timer
    async def setup(self) -> bool:
        """
        Initializes async components and variables
        (had to do it since all functions are async not normal sync)
        """
        print("Saving User....")
        user = await self._find_or_save_user_record()
        
        print("Saving Group Information....")
        group = await self._find_or_save_group(user)
        
        print("Saving and embedding chats...")
        result = await self._save_chats(group)
        
        return result
        
    
    @async_timer
    async def _find_or_save_user_record(self) -> User:
        '''
        if user exists, returned, otherwise saved and returned
        '''
        
        async with AsyncSession(bind=engine) as session:
            result = await session.execute(
                select(User)
                .where(User.id == self.user_details.user_id)
            )
            user = result.scalar()
            
            if user:
                return user
                
            user = User(
                id=self.user_details.user_id,
                username=self.user_details.username
            )
            
            session.add(user)
            await session.commit()
            
            return user
                   
        
    @async_timer
    async def _find_or_save_group(self, user: User) -> Group:
        '''
        If `Group` exists, return it.
        Otherwise, create, save and return it.
        '''
        
        async with AsyncSession(bind=engine) as session:
            
            user = await session.merge(user)
            
            result = await session.execute(
                select(Group).where(
                    (Group.g_id_client == self.group_details.group_id) & (Group.user_id == user.id)
                )
            )
            
            group = result.scalar()
            
            if group:
                return group
            
            
            group = Group(
                g_id_client = self.group_details.group_id,
                group_name=self.group_details.group_name,
                user=user
            )
            
            session.add(group)
            await session.commit()
            
            return group
            
        
    
    @async_timer
    async def _chunk_chat_history(self, chats: list[ChatSchema]) -> list[ChatChunkSchema]:
        chunks: list[ChatChunkSchema] = []
        last_chat_time: datetime | None = None
        current_chunk_text = ""
        chunk_start_time: datetime | None = None
        current_chunk_usernames: list[str] = []
        
        
        for chat in chats:
            current_chat_time = chat.created_at
            
            # [10:01 AM] Alice: Hey
            formatted_text = f"[{current_chat_time.strftime('%H:%M')}] {chat.username}: {chat.message}\n"
            current_user = chat.username
            
            # If first chat or we fine 10 mins gap, then start new text
            if last_chat_time is None or (current_chat_time - last_chat_time) > timedelta(minutes=self.MAX_TIME_GAP_MINUTES):
                
                if current_chunk_text:
                    chunks.append(
                        ChatChunkSchema(
                            chats_set=current_chunk_text.strip(), 
                            start_time=chunk_start_time, 
                            end_time=last_chat_time,
                            sent_by_users=current_chunk_usernames, 
                        )
                    )
                    current_chunk_text = ""
                    current_chunk_usernames.clear()
                    
                current_chunk_usernames.append(current_user)
                current_chunk_text = formatted_text
                chunk_start_time = current_chat_time
                
            
            else:
                current_chunk_text += formatted_text
                current_chunk_usernames.append(current_user)
                
            last_chat_time = current_chat_time
            
        # Appending final chunk, since it will surely miss outside the loop
        if current_chunk_text:
            chunks.append(
                ChatChunkSchema(
                    chats_set=current_chunk_text.strip(), 
                    start_time=chunk_start_time, 
                    end_time=last_chat_time,
                    sent_by_users=current_chunk_usernames, 
                )
            )
        
        
        return chunks
                
                
    @async_timer
    async def _get_embeddings(self, chat_chunks: list[ChatChunkSchema]):
        embedding_model = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001", output_dimensionality=768)
        print("length of chat recieved in embedding model: ", len(chat_chunks))
        chat_sets = [chunk.chats_set for chunk in chat_chunks]
        
        print("Chat sets: ", chat_sets)
        vectors = embedding_model.embed_documents(chat_sets)
        
        print("List of vector size: ", len(vectors))
        
        return vectors
        
    
    @async_timer
    async def _get_last_chat_timestamp(self, group: Group) -> datetime | None:
        
        async with AsyncSession(bind=engine) as session:
            result = await session.execute(
                select(ChatTranscript.end_time_stamp)
                .where(ChatTranscript.group_id == group.id)
                .order_by(ChatTranscript.end_time_stamp.desc())
                .limit(1)
            )
            return result.scalar()
        
        
    @async_timer
    async def _filter_new_chats(self, chats: list[ChatSchema], group: Group) -> list[ChatSchema]:
        last_timestamp = await self._get_last_chat_timestamp(group)
        
        print(f"Last timestamp in DB: {last_timestamp}")
        print(f"Received {len(chats)} total chats")
        
        if last_timestamp is None:
            print("No previous chats, returning all")
            return chats
        
        new_chats = [chat for chat in chats if chat.created_at > last_timestamp]
        print(f"After filtering: {len(new_chats)} new chats")
        for chat in new_chats:
            print(f"   - {chat.username}: {chat.created_at}")
        
        return new_chats
    
    @async_timer
    async def _save_chats(self, group: Group) -> bool:
        '''
        - If Chat saved successfully: `True`.
        - Else: `False`.
        '''
        
        try:    
            async with AsyncSession(bind=engine) as session:
                group = await session.merge(group)
                
                new_chats = await self._filter_new_chats(self.chats, group)
                
                if not new_chats:
                    print("No new chats to save")
                    return True
                
                chat_transcripts: list[ChatTranscript] = []
                chunks = await self._chunk_chat_history(new_chats)
                embeddings = await self._get_embeddings(chunks)
                
                for emb in embeddings:
                    print(str(emb[:10]) + "...")
                print("Chunks received: ", chunks)
                
                
                for chat_chunk, vector in zip(chunks, embeddings):
                    chat_transcripts.append(
                        ChatTranscript(
                            sent_by_users = list(set(chat_chunk.sent_by_users)),
                            chats_set_transcript=chat_chunk.chats_set,
                            embedding = vector,
                            start_time_stamp=chat_chunk.start_time,
                            end_time_stamp = chat_chunk.end_time,
                            group_id=group.id,
                        )
                    )

                await session.run_sync(lambda sync_session: sync_session.bulk_save_objects(chat_transcripts))
                await session.commit()
                return True
        
        except Exception as e:
            print("Exception during saving Chats: ", e)
            return False
        
