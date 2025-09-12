from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime

class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    preprompt: Optional[str] = None
    is_private: Optional[bool] = True

class WorkspaceOut(BaseModel):
    id: UUID4
    name: str
    description: Optional[str]
    pre_prompt: Optional[str] = None
    is_private: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UpdatePrePrompt(BaseModel):
    pre_prompt: str