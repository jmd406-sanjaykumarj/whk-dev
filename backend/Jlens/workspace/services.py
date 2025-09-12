from sqlalchemy.orm import Session
from uuid import UUID
from db.models import Workspace
from .schemas import WorkspaceCreate
from azure.storage.blob.aio import BlobServiceClient
from fastapi import UploadFile
import os

# AZURE_BLOB_STORAGE_CONNECTION_STRING = os.getenv("AZURE_BLOB_STORAGE_CONNECTION_STRING")
# AZURE_BLOB_STORAGE_CONTAINER_NAME = os.getenv("AZURE_BLOB_STORAGE_CONTAINER_NAME")

# blob_service_client = BlobServiceClient.from_connection_string(AZURE_BLOB_STORAGE_CONNECTION_STRING)

def create_workspace(db: Session, user_id: UUID, data: WorkspaceCreate) -> Workspace:
    workspace = Workspace(
        name=data.name,
        description=data.description,
        pre_prompt=data.preprompt,
        is_private=data.is_private,
        user_id=user_id
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

def get_user_workspaces(db: Session, user_id: UUID):
    return db.query(Workspace).filter(Workspace.user_id == user_id).all()

def get_shared_workspaces(db: Session, workspace_id: UUID):
    return db.query(Workspace).filter(Workspace.id == workspace_id).all()

def delete_workspace(db: Session, workspace_id: UUID, user_id: UUID) -> bool:
    workspace = db.query(Workspace).filter(Workspace.id == workspace_id, Workspace.user_id == user_id).first()
    if workspace:
        db.delete(workspace)
        db.commit()
        return True
    return False

def update_pre_prompt(db: Session, workspace_id: UUID, new_pre_prompt: str) -> Workspace | None:
    workspace = db.query(Workspace).filter(
        Workspace.id == workspace_id,
    ).first()

    if not workspace:
        return None

    workspace.pre_prompt = new_pre_prompt
    db.commit()
    db.refresh(workspace)
    return workspace

# async def upload_file_to_azure_blob(file: bytes, blob_path: str):
#     container_client = blob_service_client.get_container_client(AZURE_BLOB_STORAGE_CONTAINER_NAME)
#     blob_client = container_client.get_blob_client(blob_path)
#     await blob_client.upload_blob(file, overwrite=True)