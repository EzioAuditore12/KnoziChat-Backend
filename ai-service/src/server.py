import sys
import grpc
import grpc.aio

import ai_pb2
import ai_pb2_grpc

import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI

from schemas import QueryProcessRequestSchema, ConversationSchema, ChatSchema
from services.ai_service import AIService as RealAIService
        
# Fix for Windows: psycopg cannot use ProactorEventLoop for async mode
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


class AIService(ai_pb2_grpc.AIServiceServicer):

    async def AskAI(self, request, context):
        try:
            import os
            
            GEMINI_LLM_MODEL = os.environ.get("GEMINI_LLM_MODEL", "gemini-2.5-flash")
            
            prompt = request.prompt
            print("Prompt:", prompt)

            llm = ChatGoogleGenerativeAI(
                model=GEMINI_LLM_MODEL,
                max_retries=2,
            )
            
            # Using synchronous invoke or ainvoke based on langchain version, ainvoke is safer in async method
            response = await llm.ainvoke([prompt])
            content = response.content

            if isinstance(content, str):
                response_text = content
            elif isinstance(content, list) and content and isinstance(content[0], dict):
                response_text = content[0].get('text', str(content))
            else:
                response_text = str(content)

            return ai_pb2.AIResponse(
                response=response_text
            )
        except Exception as e:
            print(f"Error in AskAI: {e}")
            return ai_pb2.AIResponse(
                response=f"Error: {str(e)}"
            )

    async def ProcessQuery(self, request, context):
 
        conversation = ConversationSchema(conversation_id=request.group.group_id, conversation_name=request.group.group_name)
        chats = []
        for chat in request.chats:
            chats.append(ChatSchema(username=chat.username, message=chat.message, created_at=chat.created_at))
            
        request_body = QueryProcessRequestSchema(
            conversation=conversation,
            chats=chats,
            query=request.query
        )
        
        service = RealAIService()
        
        result = await service.process_query(request_body, request.user_id, request.username)
        
        return ai_pb2.ProcessQueryResponse(response=result.get("response", "") if result and result.get("response") else "")

    async def EmbedMessage(self, request, context):
        try:
            from datetime import datetime
            from utils.embedding_utils import HandleParsing
            from schemas import ConversationSchema, ChatSchema
            created_at_dt = datetime.fromisoformat(request.created_at.replace("Z", "+00:00")).replace(tzinfo=None)
            
            # Use sender_id as username fallback if needed
            chat = ChatSchema(
                username=request.sender_id,
                message=request.content,
                created_at=created_at_dt
            )

            
            # SnowFlake IDs are integers
            group_id_int = int(request.conversation_id) if request.conversation_id.isdigit() else 0
            
            conversation_details = ConversationSchema(
                conversation_id=group_id_int,
                conversation_name="Group Chat" if request.is_group else "Direct Chat"
            )
            
            setup_completed = await HandleParsing(
                conversation_details=conversation_details,
                chats=[chat]
            ).setup()
            
            if not setup_completed:
                return ai_pb2.EmbedMessageResponse(success=False, error="Failed to save and embed chat")
                
            return ai_pb2.EmbedMessageResponse(success=True, error="")
            
        except Exception as e:
            print(f"Error in EmbedMessage: {e}")
            return ai_pb2.EmbedMessageResponse(success=False, error=str(e))

    async def SeedChats(self, request, context):
        try:
            from datetime import datetime
            from utils.embedding_utils import HandleParsing
            from schemas import ConversationSchema, ChatSchema
            
            group_id_int = int(request.conversation_id) if request.conversation_id.isdigit() else 0
            
            conversation_details = ConversationSchema(
                conversation_id=group_id_int,
                conversation_name="Group Chat" if request.is_group else "Direct Chat"
            )
            
            chats_to_seed = []
            for chat in request.chats:
                created_at_dt = datetime.fromisoformat(chat.created_at.replace("Z", "+00:00")).replace(tzinfo=None)
                chats_to_seed.append(ChatSchema(
                    username=chat.username,
                    message=chat.message,
                    created_at=created_at_dt
                ))
            
            setup_completed = await HandleParsing(
                conversation_details=conversation_details,
                chats=chats_to_seed
            ).setup()
            
            if not setup_completed:
                return ai_pb2.SeedChatsResponse(success=False, message="Failed to seed chats")
                
            return ai_pb2.SeedChatsResponse(success=True, message="Successfully seeded chats")
            
        except Exception as e:
            print(f"Error in SeedChats: {e}")
            return ai_pb2.SeedChatsResponse(success=False, message=str(e))


async def serve():
    from settings import init_db
    await init_db()

    server = grpc.aio.server()

    ai_pb2_grpc.add_AIServiceServicer_to_server(
        AIService(),
        server
    )

    server.add_insecure_port("[::]:50051")

    print("gRPC Server Running on 50051")

    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())