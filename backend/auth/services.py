from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.models import User, UserComponentAccess, Workspace
from auth.jwt_utils import create_access_token
from auth.schemas import UserCreate, UserComponentAccessCreate, WorkspaceCreate, UserCreateMicrosoft
from passlib.context import CryptContext
import uuid
from auth.deps import get_db
from jose import JWTError, jwt
from auth.jwt_utils import SECRET_KEY, ALGORITHM
from uuid import UUID

pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__default_rounds=12)

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    return user

def authenticate_user_microsoft(db: Session, name: str, email: str, id: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def login_user(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)
    token = create_access_token(data={"sub": user.email,"user_id": str(user.id),"user_name": str(user.name)})
    return {"access_token": token, "token_type": "bearer"}

def login_user_microsoft(db: Session, name: str, email: str, id : str):
    user = authenticate_user_microsoft(db, name, email, id)
    token = create_access_token(data={"sub": user.email,"user_id": str(user.id),"user_name": str(user.name)})
    return {"access_token": token, "token_type": "bearer"}

def check_user_exists(db: Session, email: str) -> bool:
    return db.query(User).filter_by(email=email).first() is not None

def create_user(db: Session, user_data: UserCreate) -> User:
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    hashed_password = pwd_context.hash(user_data.password)

    user = User(
        email=user_data.email,
        password_hash=hashed_password,
        name=user_data.name,
        designation=user_data.designation
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_user_microsoft(db: Session, user_data: UserCreateMicrosoft) -> User:
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # hashed_password = pwd_context.hash(user_data.password)

    user = User(
        email=user_data.email,
        # password_hash=hashed_password,
        microsoft_id=user_data.id,  # Generate a unique Microsoft ID
        name=user_data.name,
        designation=user_data.designation
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def create_user_access(db: Session, access: UserComponentAccessCreate):
    db_access = UserComponentAccess(**access.dict())
    db.add(db_access)
    db.commit()
    db.refresh(db_access)
    return db_access

def create_workspace(db: Session, data: WorkspaceCreate) -> Workspace:
    workspace = Workspace(
        name=data.name,
        description=data.description,
        is_private=data.is_private,
        user_id=data.user_id
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace

def get_sharepoint_workspace(db: Session) -> Workspace:
    sharepoint_workspace = db.query(Workspace).filter(Workspace.name == "WHK Contracts").first()
    return sharepoint_workspace