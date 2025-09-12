from sqlalchemy.orm import Session
from uuid import UUID
from . import schemas
from db.models import UserComponentAccess

def create_user_access(db: Session, access: schemas.UserComponentAccessCreate):
    db_access = UserComponentAccess(**access.dict())
    db.add(db_access)
    db.commit()
    db.refresh(db_access)
    return db_access

def update_user_access(db: Session, access_id: UUID, access_update: schemas.UserComponentAccessUpdate):
    db_access = db.query(UserComponentAccess).filter_by(id=access_id).first()
    if not db_access:
        return None
    for field, value in access_update.dict(exclude_unset=True).items():
        setattr(db_access, field, value)
    db.commit()
    db.refresh(db_access)
    return db_access

def delete_user_access(db: Session, access_id: UUID):
    db_access = db.query(UserComponentAccess).filter_by(id=access_id).first()
    if db_access:
        db.delete(db_access)
        db.commit()
        return True
    return False

def get_user_access_by_user(db: Session, user_id: UUID):
    return db.query(UserComponentAccess).filter_by(user_id=user_id).all()
