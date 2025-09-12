from sqlalchemy.orm import Session
from uuid import UUID
from . import services, schemas
from typing import List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from db.models import FileMetadata, FileMetadataType, User, Workspace
from datetime import datetime, time
import os
import requests
from dotenv import load_dotenv
load_dotenv()

# AZURE_BLOB_STORAGE_ACCOUNT_NAME= os.environ.get("AZURE_BLOB_STORAGE_ACCOUNT_NAME")
# AZURE_BLOB_STORAGE_CONTAINER_NAME= os.environ.get("AZURE_BLOB_STORAGE_CONTAINER_NAME")

AZURE_SEARCH_SERVICE = os.getenv("AZURE_SEARCH_SERVICE")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AZURE_SEARCH_SERVICE_INDEXER_WORKSPACE_NAME = os.getenv("AZURE_SEARCH_SERVICE_INDEXER_WORKSPACE_NAME")

def create_workspace_controller(db: Session, current_user: User, data: schemas.WorkspaceCreate):
    return services.create_workspace(db, current_user.id, data)

def create_sharepoint_workspace_controller(db: Session):
    return services.create_workspace(db, None, schemas.WorkspaceCreate(name="WHK Contracts", description="Contract related workspace", is_private=False))

def get_user_workspaces_controller(db: Session, current_user: User):
    return services.get_user_workspaces(db, current_user.id)

def get_user_shared_workspaces_controller(db: Session, workspace_id: UUID):
    return services.get_shared_workspaces(db, workspace_id)

def delete_workspace_controller(db: Session, current_user: User, workspace_id: UUID):
    return services.delete_workspace(db, workspace_id, current_user.id)

def update_pre_prompt_controller(
    workspace_id: UUID,
    data: schemas.UpdatePrePrompt,
    db: Session 
):
    updated = services.update_pre_prompt(db, workspace_id, data.pre_prompt)

    if not updated:
        raise HTTPException(status_code=404, detail="Workspace not found or not authorized to update")

    return updated


async def upload_files_controller(db: Session, user: User, workspaceId: UUID, files: List[UploadFile]):
    MAX_FILES = 20
    MAX_FILE_SIZE = 16 * 1024 * 1024  # 16 MB in bytes

    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail="Cannot upload more than 20 files at once.")

    uploaded_metadata = []

    for file in files:
        contents = await file.read()

        # Check file size
        if len(contents) > MAX_FILE_SIZE:
            uploaded_metadata.append({
                "filename": file.filename,
                "error": "file greater than 16MB"
            })
            continue

        # Lookup workspace
        workspace = (
            db.query(Workspace)
            .filter(Workspace.user_id == user.id, Workspace.id == workspaceId)
            .first()
        )

        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")

        # Generate blob path
        blob_path = f"{workspace.name}-{user.email}/workspaces----{workspace.name}-{user.email}----{file.filename}"

        # Upload to Azure
        # await services.upload_file_to_azure_blob(contents, blob_path)  # <-- contents, not file

        # Save metadata
        metadata = FileMetadata(
            type=FileMetadataType.workspace,
            workspace_id=workspace.id,
            name=file.filename,
            full_path=blob_path,
            link=f"https://.blob.core.windows.net/{blob_path}",
            uploaded_by_name=user.name,
            uploaded_by_email=user.email,
            created_at=datetime.now()
        )

        db.add(metadata)
        uploaded_metadata.append({
            "filename": file.filename,
            "link": metadata.link
        })
    # Trigger the indexer
    try:
        indexer_url = f'https://{AZURE_SEARCH_SERVICE}.search.windows.net/indexers/{AZURE_SEARCH_SERVICE_INDEXER_WORKSPACE_NAME}/run?api-version=2020-06-30'
        headers = {
            'api-key': AZURE_SEARCH_KEY,
            'Content-Type': 'application/json'
        }
        response = requests.post(indexer_url, headers=headers)
        response.raise_for_status()
        print("Triggered indexer successfully")

        # Poll for indexer status
        indexer_status_url = f'https://{AZURE_SEARCH_SERVICE}.search.windows.net/indexers/{AZURE_SEARCH_SERVICE_INDEXER_WORKSPACE_NAME}/status?api-version=2020-06-30'

        max_retries = 10
        wait_time = 5
        last_run_status = "Unknown"
        last_run_error = ""

        for _ in range(max_retries):
            status_response = requests.get(indexer_status_url, headers=headers)
            status_data = status_response.json()

            last_run_status = status_data.get("lastResult", {}).get("status", "Unknown")
            last_run_error = status_data.get("lastResult", {}).get("errorMessage", "")

            if last_run_status in ["success", "transientFailure", "permanentFailure"]:
                break

            time.sleep(wait_time)
        
    except Exception as e:
        print(e)
    finally:

        db.commit()
        return {
            "success": True, 
            "uploaded": uploaded_metadata,
            "indexer_status": last_run_status,
            "error_message": last_run_error,
            "status": last_run_status == "success"
        }
