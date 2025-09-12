from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from auth.deps import get_db
from auth.services import get_current_user
from . import schemas, controllers
from db.models import User

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.post("/", response_model=schemas.ConversationOut)
def create_conversation(
    conversation_in: schemas.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controllers.create_conversation_controller(db, current_user, conversation_in)

@router.get("/", response_model=List[schemas.ConversationOut])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("Fetching user conversations for:", current_user.id)
    return controllers.get_user_conversations_controller(db, current_user)

@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    controllers.delete_conversation_controller(db, conversation_id, current_user)

@router.get("/workspaces/{workspace_id}", response_model=List[schemas.ConversationOut])
def get_user_shared_conversations(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return controllers.get_user_sharedworkspace_conversations_controller(db, workspace_id, current_user)

@router.get("/{conversation_id}", response_model=List[schemas.MessageOut])
def get_messages_by_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return controllers.list_messages_by_conversation_controller(db, conversation_id)