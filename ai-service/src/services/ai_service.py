from uuid import UUID

from langchain_google_genai import ChatGoogleGenerativeAI
from env import GEMINI_LLM_MODEL_ONE, GEMINI_LLM_MODEL_TWO, GEMINI_LLM_MODEL_THREE
from schemas import QueryProcessRequestSchema
from utils import HandleParsing, HandleLLM


class AIService:

    async def ask_ai(self, prompt: str) -> str:
        llms = []
        for model_name in [GEMINI_LLM_MODEL_ONE, GEMINI_LLM_MODEL_TWO, GEMINI_LLM_MODEL_THREE]:
            if model_name:
                llms.append(ChatGoogleGenerativeAI(model=model_name, max_retries=1))
        
        llm = llms[0]
        if len(llms) > 1:
            llm = llms[0].with_fallbacks(llms[1:])

        
        response = await llm.ainvoke([prompt])
        content = response.content

        if isinstance(content, str):
            return content
        elif isinstance(content, list) and content and isinstance(content[0], dict):
            return content[0].get('text', str(content))
        else:
            return str(content)

    async def process_query(self, request_body: QueryProcessRequestSchema, user_id: str, username: str):
        try:
            user_id_uuid = UUID(user_id)

            if request_body.chats:
                setup_completed = await HandleParsing(
                    conversation_details=request_body.conversation,
                    chats=request_body.chats,
                ).setup()

                if not setup_completed:
                    raise RuntimeError("Something went wrong while saving chats...")

            llm_handle = HandleLLM(
                user_id=str(user_id_uuid),
                conversation_id=request_body.conversation.conversation_id,
                query=request_body.query,
                username=username,
            )

            async for chunk in llm_handle.resolve_query():
                yield {"response": chunk}

        except Exception as e:
            raise RuntimeError(str(e))
