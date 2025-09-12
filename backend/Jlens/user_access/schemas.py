from pydantic import BaseModel, UUID4
from typing import Optional

class UserComponentAccessCreate(BaseModel):
    user_id: UUID4
    component: str
    component_type: str

class UserComponentAccessUpdate(BaseModel):
    component: Optional[str]
    component_type: Optional[str]

class UserComponentAccessOut(BaseModel):
    id: UUID4
    user_id: UUID4
    component: str
    component_type: str

    class Config:
        orm_mode = True
