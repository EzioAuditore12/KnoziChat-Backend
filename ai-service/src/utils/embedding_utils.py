from schemas import ChatSchema
from models import Conversation, ChatTranscript
from sqlalchemy import  select
from sqlalchemy.ext.asyncio import AsyncSession
from settings import engine
from datetime import timedelta, datetime
from pydantic import BaseModel
from typing import Optional
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from schemas import ConversationSchema
from .extras import async_timer


from env import GEMINI_EMBEDDING_MODEL

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
        conversation_details: ConversationSchema, 
        chats: list[ChatSchema]
    ) -> None:
        
        self.conversation_details = conversation_details
        self.chats = chats
        
        self.MAX_TIME_GAP_MINUTES = 5
        

        
    @async_timer
    async def setup(self) -> bool:
        """
        Initializes async components and variables
        (had to do it since all functions are async not normal sync)
        """
        print("Saving Conversation Information....")
        conversation = await self._find_or_save_conversation()
        
        print("Saving and embedding chats...")
        result = await self._save_chats(conversation)
        
        return result
        
    
    @async_timer
    async def _find_or_save_conversation(self) -> Conversation:
        '''
        If `Conversation` exists, return it.
        Otherwise, create, save and return it.
        '''
        
        async with AsyncSession(bind=engine) as session:
                        
            result = await session.execute(
                select(Conversation).where(
                    (Conversation.conversation_id_client == self.conversation_details.conversation_id)
                )
            )
            
            conversation = result.scalar()
            
            if conversation:
                return conversation
            
            
            conversation = Conversation(
                conversation_id_client = self.conversation_details.conversation_id,
                conversation_name=self.conversation_details.conversation_name,
            )
            
            session.add(conversation)
            await session.commit()
            
            return conversation
            
        
    
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
        embedding_model = GoogleGenerativeAIEmbeddings(model=GEMINI_EMBEDDING_MODEL, output_dimensionality=768)
        print("length of chat recieved in embedding model: ", len(chat_chunks))
        chat_sets = [chunk.chats_set for chunk in chat_chunks]
        
        print("Chat sets: ", chat_sets)
        vectors = await embedding_model.aembed_documents(chat_sets)
        
        print("List of vector size: ", len(vectors))
        
        return vectors
        
    
    @async_timer
    async def _get_last_chat_timestamp(self, conversation: Conversation) -> datetime | None:
        
        async with AsyncSession(bind=engine) as session:
            result = await session.execute(
                select(ChatTranscript.end_time_stamp)
                .where(ChatTranscript.conversation_id == conversation.id)
                .order_by(ChatTranscript.end_time_stamp.desc())
                .limit(1)
            )
            return result.scalar()
        
        
    @async_timer
    async def _filter_new_chats(self, chats: list[ChatSchema], conversation: Conversation) -> list[ChatSchema]:
        last_timestamp = await self._get_last_chat_timestamp(conversation)
        
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
    async def _save_chats(self, conversation: Conversation) -> bool:
        '''
        - If Chat saved successfully: `True`.
        - Else: `False`.
        '''
        
        try:    
            async with AsyncSession(bind=engine) as session:
                conversation = await session.merge(conversation)
                
                # Fetch last transcript to potentially append to it
                result = await session.execute(
                    select(ChatTranscript)
                    .where(ChatTranscript.conversation_id == conversation.id)
                    .order_by(ChatTranscript.end_time_stamp.desc())
                    .limit(1)
                )
                last_transcript = result.scalar()
                
                new_chats = await self._filter_new_chats(self.chats, conversation)
                
                if not new_chats:
                    print("No new chats to save")
                    return True
                
                chunks = await self._chunk_chat_history(new_chats)
                
                # Check if we should merge the first chunk with the last transcript
                if last_transcript and chunks:
                    first_chunk = chunks[0]
                    # If the gap between last transcript end time and first chunk start time is <= 5 minutes
                    if (first_chunk.start_time - last_transcript.end_time_stamp) <= timedelta(minutes=self.MAX_TIME_GAP_MINUTES):
                        print(f"Merging first chunk with previous transcript (gap: {first_chunk.start_time - last_transcript.end_time_stamp})")
                        
                        last_transcript.chats_set_transcript += "\n" + first_chunk.chats_set
                        last_transcript.end_time_stamp = first_chunk.end_time
                        last_transcript.sent_by_users = list(set(last_transcript.sent_by_users + first_chunk.sent_by_users))
                        
                        # Recompute embedding for the merged transcript
                        temp_chunk = ChatChunkSchema(
                            chats_set=last_transcript.chats_set_transcript, 
                            sent_by_users=[], 
                            start_time=None, 
                            end_time=None
                        )
                        new_embedding = (await self._get_embeddings([temp_chunk]))[0]
                        last_transcript.embedding = new_embedding
                        
                        session.add(last_transcript)
                        
                        # Remove the merged chunk
                        chunks.pop(0)

                chat_transcripts: list[ChatTranscript] = []
                if chunks:
                    embeddings = await self._get_embeddings(chunks)
                    
                    for chat_chunk, vector in zip(chunks, embeddings):
                        chat_transcripts.append(
                            ChatTranscript(
                                sent_by_users = list(set(chat_chunk.sent_by_users)),
                                chats_set_transcript=chat_chunk.chats_set,
                                embedding = vector,
                                start_time_stamp=chat_chunk.start_time,
                                end_time_stamp = chat_chunk.end_time,
                                conversation_id=conversation.id,
                            )
                        )

                    session.add_all(chat_transcripts)

                await session.commit()
                return True
        
        except Exception as e:
            print("Exception during saving Chats: ", e)
            return False
        