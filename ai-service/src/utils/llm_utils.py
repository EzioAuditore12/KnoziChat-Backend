from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from sqlalchemy.ext.asyncio import AsyncSession
from settings import engine
from models import ChatTranscript, Conversation
from sqlalchemy import select
from .extras import async_timer
from pprint import pprint
from pydantic import BaseModel
import json
import redis



from env import GEMINI_LLM_MODEL_ONE, GEMINI_LLM_MODEL_TWO, GEMINI_LLM_MODEL_THREE, GEMINI_EMBEDDING_MODEL, REDIS_URL

class ChatHistorySchema(BaseModel):
    human_response: str
    llm_response: str


class HandleLLM:
    def __init__(
        self, 
        query: str,
        user_id: str,
        username: str,
        conversation_id: int,
        
    ) -> None:
        
        self.query = query
        self.user_id = user_id
        self.conversation_id = conversation_id
        self.username = username
        
        self.REDIS_KEY = f"{self.user_id}_chats"
        self.cache = redis.from_url(REDIS_URL, decode_responses=True)
        
    
    async def _get_embedding(self, text: str):
        embedding_model = GoogleGenerativeAIEmbeddings(model=GEMINI_EMBEDDING_MODEL, output_dimensionality=768)
        
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
                    .join(Conversation)
                    .where(Conversation.conversation_id_client == self.conversation_id)
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
        
        
    @async_timer
    async def _get_previous_chats(self) -> tuple[str, list[ChatHistorySchema]]:
        """
        Returns 
        """
        
        chat_history_json = self.cache.get(self.REDIS_KEY)
        chat_history: list[ChatHistorySchema] = []
        
        if chat_history_json:
            try:
                # Deserialize JSON from Redis
                chat_history_data = json.loads(chat_history_json)
                chat_history = [ChatHistorySchema(**chat) for chat in chat_history_data]
            except Exception as e:
                print(f"Error deserializing chat history: {e}")
                chat_history = []
                
        formatted_history = ""
        if chat_history:
            formatted_history = "\n".join([
                f"User: {chat.human_response}\nAI: {chat.llm_response}\n---"
                for chat in chat_history
            ])
            
            formatted_history += "\nSince there their are chat history of user with you, do not give any salutations and give straight answer like in normal chats"
        else:
            formatted_history = "No previous chat history"
            
        return formatted_history, chat_history
    
    
    
    async def _generate_response(self):
        context, _ = await self._retrieve_context()
        formatted_history, chat_history = await self._get_previous_chats()
              
        final_prompt = f"""
        You are a chatting model and your goal is to answer user's query by generating a casual short or medium size chat response for user.\n
        
        User's name who asked query: {self.username}
        Context: {context}
        
        Your Previous Chat History with user:
        {formatted_history}
        
        Current Query: {self.query}
        """
        
        print("Final Prompt: ")
        pprint(final_prompt)
        
        
        
        llms = []
        for model_name in [GEMINI_LLM_MODEL_ONE, GEMINI_LLM_MODEL_TWO, GEMINI_LLM_MODEL_THREE]:
            if model_name:
                llms.append(ChatGoogleGenerativeAI(model=model_name, max_retries=1))
        
        llm = llms[0]
        if len(llms) > 1:
            llm = llms[0].with_fallbacks(llms[1:])
        
        full_response = ""
        async for chunk in llm.astream([final_prompt]):
            if chunk.content:
                # content can be a string or list of dicts depending on the model, but usually string for astream
                content = str(chunk.content)
                full_response += content
                yield content
                
        new_chat_set = ChatHistorySchema(
            human_response=self.query,
            llm_response=full_response,
        )
        
        chat_history.append(new_chat_set)

        chat_history_json = json.dumps([chat.model_dump() for chat in chat_history])
        self.cache.set(self.REDIS_KEY, chat_history_json, 3600 * 3)
        
    
    async def resolve_query(self):
        async for chunk in self._generate_response():
            yield str(chunk)