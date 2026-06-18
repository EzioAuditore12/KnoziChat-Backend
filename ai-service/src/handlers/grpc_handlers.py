import ai_pb2
import ai_pb2_grpc
from datetime import datetime

from schemas import QueryProcessRequestSchema, ConversationSchema, ChatSchema
from services.ai_service import AIService as RealAIService
from utils.embedding_utils import HandleParsing

class AIService(ai_pb2_grpc.AIServiceServicer):

    async def AskAI(self, request, context):
        try:
            prompt = request.prompt
            print("Prompt:", prompt)

            service = RealAIService()
            response_text = await service.ask_ai(prompt)

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
        
        async for result in service.process_query(request_body, request.user_id, request.username):
            yield ai_pb2.ProcessQueryResponse(
                response=result.get("response", "") if result and result.get("response") else ""
            )

    async def EmbedMessage(self, request, context):
        try:
            created_at_dt = datetime.fromisoformat(request.created_at.replace("Z", "+00:00")).replace(tzinfo=None)
            
            chat = ChatSchema(
                username=request.sender_id,
                message=request.content,
                created_at=created_at_dt
            )
            
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
