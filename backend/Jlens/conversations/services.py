from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from db.models import Conversation, User, Message
from . import schemas as convo_schemas

def create_conversation_db(db: Session, user: User, convo_in: convo_schemas.ConversationCreate):
    new_convo = Conversation(
        title=convo_in.title,
        workspace_id=convo_in.workspace_id,
        user_id=user.id,
        component_type=convo_in.component_type
    )
    db.add(new_convo)
    db.commit()
    db.refresh(new_convo)
    return new_convo

def get_conversations_by_user_db(db: Session, user_id: UUID):
    return db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.created_at.desc()).all()

def get_conversations_by_sharedworkspace_db(db: Session, workspace_id: UUID, user_id: UUID):
    return db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).filter(
        Conversation.workspace_id == workspace_id
    ).order_by(Conversation.created_at.desc()).all()

def delete_conversation_db(db: Session, conversation_id: UUID, user_id: UUID):
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found or not owned by user")
    db.delete(convo)
    db.commit()

def get_messages_by_conversation(db: Session, conversation_id: UUID):
    return (
        db.query(Message)
        .filter_by(conversation_id=conversation_id)
        .order_by(Message.created_at)
        .all()
    )
