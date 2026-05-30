import sys
import grpc
import grpc.aio

import ai_pb2
import ai_pb2_grpc

import asyncio

# Fix for Windows: psycopg cannot use ProactorEventLoop for async mode
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from schemas import QueryProcessRequestSchema, BaseGroupSchema, ChatSchema
from services.ai_service import AIService as RealAIService
        

class AIService(ai_pb2_grpc.AIServiceServicer):

    async def AskAI(self, request, context):

        prompt = request.prompt

        print("Prompt:", prompt)

        return ai_pb2.AIResponse(
            response=f"AI Response: {prompt}"
        )

    async def ProcessQuery(self, request, context):
 
        group = BaseGroupSchema(group_id=request.group.group_id, group_name=request.group.group_name)
        chats = []
        for chat in request.chats:
            chats.append(ChatSchema(username=chat.username, message=chat.message, created_at=chat.created_at))
            
        request_body = QueryProcessRequestSchema(
            group=group,
            chats=chats,
            query=request.query
        )
        
        service = RealAIService()
        
        result = await service.process_query(request_body, request.user_id, request.username)
        
        return ai_pb2.ProcessQueryResponse(response=result.get("response", "") if result and result.get("response") else "")


async def serve():

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