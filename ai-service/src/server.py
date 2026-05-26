from concurrent import futures
import grpc

import ai_pb2
import ai_pb2_grpc


class AIService(ai_pb2_grpc.AIServiceServicer):

    def AskAI(self, request, context):

        prompt = request.prompt

        print("Prompt:", prompt)

        return ai_pb2.AIResponse(
            response=f"AI Response: {prompt}"
        )


def serve():

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    ai_pb2_grpc.add_AIServiceServicer_to_server(
        AIService(),
        server
    )

    server.add_insecure_port("[::]:50051")

    print("gRPC Server Running on 50051")

    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()