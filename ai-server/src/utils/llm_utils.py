
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
from sqlalchemy.ext.asyncio import AsyncSession
from settings import engine
from models import ChatTranscript, Group
from sqlalchemy import select
from uuid import UUID
from .extras import async_timer
from pprint import pprint

load_dotenv()
GEMINI_API_KEY=os.environ.get("GEMINI_API_KEY")


class HandleLLM:
    def __init__(
        self, 
        query: str,
        user_id: str,
        group_id: int,
        
    ) -> None:
        
        self.query = query
        self.user_id = user_id
        self.group_id = group_id
    
    
    async def _get_embedding(self, text: str):
        embedding_model = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001", output_dimensionality=768)
        
        embedding = embedding_model.embed_query(text)
        return embedding
    
    
    @async_timer
    async def _retrieve_context(self, k: int = 3):
        """
        Retrieve top-k most similar chat transcripts using cosine similarity.
        Returns the k most contextually relevant chat transcripts for the query.
        """
        
        try:
            query_embedding = await self._get_embedding(self.query)
            
            async with AsyncSession(bind=engine) as session:
                result = await session.execute(
                    select(ChatTranscript)
                    .join(Group)
                    .where(Group.g_id_client == self.group_id)
                    .order_by(ChatTranscript.embedding.cosine_distance(query_embedding))
                    .limit(k)
                )
                
                
                similar_transcripts = result.scalars().all()
                
                context = "\n---\n".join([
                        f"Users: {', '.join(t.sent_by_users)}\n"
                        f"Time: {t.start_time_stamp} to {t.end_time_stamp}\n"
                        f"Content:\n{t.chats_set_transcript}"
                        for t in similar_transcripts
                    ])
                
                return context, similar_transcripts
            
        except Exception as e:
            print("Error came during retrieving context: ", e)
            raise
        
    
    # @async_timer
    async def _generate_response(self):
        context, _ = await self._retrieve_context()
        final_prompt = f"""
        You are a chatting model and your goal is to answer user's query by generating a casual short or medium size chat response for user.\n
        Context: {context}\n\nQuery: {self.query}"""
        
        print("Final Prompt: ")
        pprint(final_prompt)
        
        llm = ChatGoogleGenerativeAI(
            # model="gemini-3.1-flash-lite-preview",
            model="gemini-2.5-flash",
            max_retries=2,
        )
        
        response = llm.invoke([final_prompt])
        # async for chunk in llm.astream(final_prompt):
        #     yield f"data: {chunk.content}\n\n"
        
        return response.content
    
    
    async def resolve_query(self):
        response = await self._generate_response()
        return response