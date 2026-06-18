import sys
import grpc
import grpc.aio

import ai_pb2
import ai_pb2_grpc

import asyncio
from handlers.grpc_handlers import AIService
import sys

# Fix for Windows: psycopg cannot use ProactorEventLoop for async mode
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


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