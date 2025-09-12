from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth.schemas import UserLogin, TokenResponse, UserResponse, UserCreate, UserLoginMicrosoft, UserCreateMicrosoft
from auth.services import create_user, create_user_access, login_user, create_workspace, get_sharepoint_workspace, login_user_microsoft, create_user_microsoft, check_user_exists
from auth.jwt_utils import create_access_token
from auth.deps import get_db
from .schemas import UserComponentAccessCreate, WorkspaceCreate

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    return login_user(db, credentials.email, credentials.password)

@router.post("/microsoft-login", response_model=TokenResponse)
def login(credentials: UserLoginMicrosoft, db: Session = Depends(get_db)):
    return login_user_microsoft(db, credentials.name, credentials.email, credentials.id)

@router.get("/user-exists")
def user_exists(email: str, db: Session = Depends(get_db)):
    return {"exists": check_user_exists(db, email)}

@router.post("/signup", response_model=UserResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    user = create_user(db, user_data)

    access_token = create_access_token(data={"sub": user.email})

    user_access_feature = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component="chat",
        component_type="feature"
    )
    )
    user_access_model = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component="gpt-4o-mini",
        component_type="model",
        source="openai"
    )
   )
    sharepoint_workspace = get_sharepoint_workspace(db)

    user_access_workspace = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component=str(sharepoint_workspace.id),
        component_type="workspace"
    )
   )

    return user

@router.post("/signup-microsoft", response_model=UserResponse)
def signup(user_data: UserCreateMicrosoft, db: Session = Depends(get_db)):
    user = create_user_microsoft(db, user_data)

    access_token = create_access_token(data={"sub": user.email})

    user_access_feature = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component="chat",
        component_type="feature"
    )
    )
    user_access_model = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component="gpt-4o-mini",
        component_type="model",
        source="openai"
    )
   )
    sharepoint_workspace = get_sharepoint_workspace(db)

    user_access_workspace = create_user_access(
    db,
    UserComponentAccessCreate(
        user_id=user.id,
        component=str(sharepoint_workspace.id),
        component_type="workspace"
    )
   )

    return user