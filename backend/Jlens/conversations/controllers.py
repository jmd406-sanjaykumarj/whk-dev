from sqlalchemy.orm import Session
from uuid import UUID
from db.models import User
from . import schemas
from fastapi import HTTPException
from .services import create_conversation_db, get_conversations_by_user_db, delete_conversation_db, get_messages_by_conversation, get_conversations_by_sharedworkspace_db


def create_conversation_controller(
    db: Session, current_user: User, conversation_in: schemas.ConversationCreate
):
    return create_conversation_db(db, current_user, conversation_in)


def get_user_conversations_controller(
    db: Session, current_user: User
):
    return get_conversations_by_user_db(db, current_user.id)

def get_user_sharedworkspace_conversations_controller(
    db: Session, workspace_id: UUID, current_user: User
):
    return get_conversations_by_sharedworkspace_db(db, workspace_id, current_user.id)


def delete_conversation_controller(
    db: Session, conversation_id: UUID, current_user: User
):
    return delete_conversation_db(db, conversation_id, current_user.id)

def list_messages_by_conversation_controller(
    db: Session, conversation_id: UUID
):
    messages = get_messages_by_conversation(db, conversation_id)
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    return messages
