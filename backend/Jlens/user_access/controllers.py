from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import services, schemas
from uuid import UUID

def create_access_controller(db: Session, access: schemas.UserComponentAccessCreate):
    return services.create_user_access(db, access)

def update_access_controller(db: Session, access_id: UUID, access_update: schemas.UserComponentAccessUpdate):
    result = services.update_user_access(db, access_id, access_update)
    if not result:
        raise HTTPException(status_code=404, detail="Access record not found")
    return result

def delete_access_controller(db: Session, access_id: UUID):
    if not services.delete_user_access(db, access_id):
        raise HTTPException(status_code=404, detail="Access record not found")
    return {"detail": "Access deleted"}

def get_access_by_user_controller(db: Session, user_id: UUID):
    return services.get_user_access_by_user(db, user_id)
