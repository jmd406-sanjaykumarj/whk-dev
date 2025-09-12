from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import MessageCreate
from .services import create_message, get_last_user_message, conversation_with_data, conversation_without_data
from uuid import UUID
from fastapi.responses import StreamingResponse
from openai.types.chat import ChatCompletionMessageParam
from db.models import ChatType
from auth.services import get_current_user


def create_message_controller(db: Session, user_id: UUID, message: MessageCreate):
    user_msg = create_message(db, user_id, message)
    if ChatType(user_msg.chat_type) != ChatType("standalone"):
        return conversation_with_data(db, user_msg, user_id, user_msg)
    else:
        return conversation_without_data(db, user_msg, user_id, user_msg)

# def stream_llm_response_controller(db: Session, user_id: UUID, conversation_id: UUID):
#     user_msg = get_last_user_message(db, conversation_id)

#     if ChatType(user_msg.chat_type) != ChatType("standalone"):
#         return conversation_with_data(db, user_msg, user_id, user_msg)
#     else:
#         return conversation_without_data(db, user_msg, user_id, user_msg)