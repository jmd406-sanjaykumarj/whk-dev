from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from uuid import UUID
from auth.deps import get_db
from auth.services import get_current_user
from db.models import User
from . import schemas, controllers
from typing import List

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.post("/", response_model=schemas.WorkspaceOut)
def create_workspace(data: schemas.WorkspaceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return controllers.create_workspace_controller(db, current_user, data)

@router.post("/sharepoint", response_model=schemas.WorkspaceOut)
def create_workspace(db: Session = Depends(get_db)):
    return controllers.create_sharepoint_workspace_controller(db)

@router.get("/", response_model=list[schemas.WorkspaceOut])
def get_workspaces(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return controllers.get_user_workspaces_controller(db, current_user)

@router.get("/{workspace_id}", response_model=list[schemas.WorkspaceOut])
def get_shared_workspaces(workspace_id: UUID, db: Session = Depends(get_db)):
    return controllers.get_user_shared_workspaces_controller(db, workspace_id)

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(workspace_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = controllers.delete_workspace_controller(db, current_user, workspace_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found or not owned by user")
    
@router.put("/{workspace_id}/pre-prompt")
def update_workspace_pre_prompt(
    workspace_id: UUID,
    data: schemas.UpdatePrePrompt,
    db: Session = Depends(get_db)
):
    return controllers.update_pre_prompt_controller(workspace_id, data, db)

@router.post("/upload-file")
async def upload_files_to_workspace(
    workspaceId: UUID = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await controllers.upload_files_controller(
        db=db,
        user=current_user,
        workspaceId=workspaceId,
        files=files
    )