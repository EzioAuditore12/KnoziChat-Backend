from uuid import UUID
from fastapi import HTTPException
from schemas import QueryProcessRequestSchema
from utils import HandleParsing, HandleLLM


class AIService:

 
    async def process_query(self, request_body: QueryProcessRequestSchema, user_id: str, username: str):
        try:
            user_id_uuid = UUID(user_id)

            if request_body.chats:
                setup_completed = await HandleParsing(
                    conversation_details=request_body.conversation,
                    chats=request_body.chats,
                ).setup()

                if not setup_completed:
                    raise HTTPException(status_code=500, detail={
                        "error": "Something went wrong while saving chats...",
                    })

            llm_handle = HandleLLM(
                user_id=str(user_id_uuid),
                conversation_id=request_body.conversation.conversation_id,
                query=request_body.query,
                username=username,
            )

            async for chunk in llm_handle.resolve_query():
                yield {"response": chunk}

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
