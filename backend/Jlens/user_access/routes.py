from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from . import controllers, schemas
from auth.deps   import get_db
from auth.services import get_current_user
from db.models import User

router = APIRouter(prefix="/user-access", tags=["User Access"])

@router.post("/", response_model=schemas.UserComponentAccessOut)
def create_user_access(access: schemas.UserComponentAccessCreate, db: Session = Depends(get_db)):
    return controllers.create_access_controller(db, access)

@router.patch("/{access_id}", response_model=schemas.UserComponentAccessOut)
def update_user_access(access_id: UUID, access_update: schemas.UserComponentAccessUpdate, db: Session = Depends(get_db)):
    return controllers.update_access_controller(db, access_id, access_update)

@router.delete("/{access_id}")
def delete_user_access(access_id: UUID, db: Session = Depends(get_db)):
    return controllers.delete_access_controller(db, access_id)


@router.get("/me", response_model=list[schemas.UserComponentAccessOut])
def get_my_access(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return controllers.get_access_by_user_controller(db, current_user.id)
