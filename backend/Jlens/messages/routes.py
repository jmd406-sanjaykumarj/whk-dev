from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from auth.deps import get_db
from auth.services import get_current_user
from .schemas import MessageCreate, MessageOut
from .controllers import create_message_controller
from typing import List
from uuid import UUID

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.post("/", response_class=StreamingResponse,    # <- tells FastAPI “send this as-is”
    summary="Send a message and stream back the AI response")
def create_message_endpoint(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_message_controller(db, current_user.id, message)

# @router.post("/stream/{conversation_id}", response_class=StreamingResponse)
# def stream_llm_response(
#     conversation_id: UUID,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     return stream_llm_response_controller(db, current_user.id, conversation_id)