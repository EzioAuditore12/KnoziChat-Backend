from uuid import UUID
from fastapi import HTTPException
from schemas import BaseUserSchema, QueryProcessRequestSchema
from utils import HandleParsing, HandleLLM


class AIService:

 
    async def process_query(self, request_body: QueryProcessRequestSchema, user_id: str, username: str):
        try:
            user_id_uuid = UUID(user_id)

            user = BaseUserSchema(user_id=user_id_uuid, username=username)

            if request_body.chats:
                setup_completed = await HandleParsing(
                    user_details=user,
                    group_details=request_body.group,
                    chats=request_body.chats,
                ).setup()

                if not setup_completed:
                    raise HTTPException(status_code=500, detail={
                        "error": "Something went wrong while saving chats...",
                    })

                llm_handle = HandleLLM(
                    user_id=str(user_id_uuid),
                    group_id=request_body.group.group_id,
                    query=request_body.query,
                    username=username,
                )

                response = await llm_handle.resolve_query()

                return {"response": response}

            return {"response": None}

        except HTTPException:
            raise

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
