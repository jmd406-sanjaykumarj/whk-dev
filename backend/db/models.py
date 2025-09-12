from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime,
    Enum, ForeignKey, Text
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum
import uuid
from sqlalchemy.dialects.postgresql import UUID

Base = declarative_base()

# --- Enums ---

class UserRole(enum.Enum):
    admin = "admin"
    user = "user"

class ComponentType(enum.Enum):
    chat = "chat"
    proposal = "proposal"
    analytics = "analytics"
    marketplace = "marketplace"

class PermissionLevel(enum.Enum):
    read = "read"
    write = "write"

class FileMetadataType(enum.Enum):
    workspace = "workspace"
    sharepoint = "sharepoint"

class ChatType(enum.Enum):
    standalone = "standalone"
    document = "document"
    hybrid = "hybrid"

# --- Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)
    microsoft_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    designation = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete")
    messages = relationship("Message", back_populates="user", cascade="all, delete")
    # file_metadata = relationship("FileMetadata", back_populates="user")
    conversations = relationship("Conversation", back_populates="owner", cascade="all, delete")
    shares = relationship("WorkspaceShare", back_populates="user", cascade="all, delete")
    access = relationship("UserComponentAccess", back_populates="user", cascade="all, delete")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    pre_prompt = Column(Text, nullable=True)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="workspaces")
    conversations = relationship("Conversation", back_populates="workspace", cascade="all, delete")
    file_metadata = relationship("FileMetadata", back_populates="workspace", cascade="all, delete")
    shares = relationship("WorkspaceShare", back_populates="workspace", cascade="all, delete")


class UserComponentAccess(Base):
    __tablename__ = "user_component_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    component = Column(String, nullable=False)
    component_type = Column(String, nullable=False)
    source = Column(String, nullable=True)

    user = relationship("User", back_populates="access")


class WorkspaceShare(Base):
    __tablename__ = "workspace_shares"

    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    permission = Column(Enum(PermissionLevel), nullable=False)

    workspace = relationship("Workspace", back_populates="shares")
    user = relationship("User", back_populates="shares")


class Conversation(Base):
    __tablename__ = "conversation"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    component_type = Column(Enum(ComponentType), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    messages = relationship("Message", back_populates="conversation", cascade="all, delete")
    workspace = relationship("Workspace", back_populates="conversations")
    owner = relationship("User", back_populates="conversations")


class Message(Base):    
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversation.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    role = Column(String(50), nullable=False)
    model_type = Column(String(50), nullable=True)
    chat_type = Column(Enum(ChatType), nullable=True)
    input_tokens = Column(Integer, nullable=False)
    output_tokens = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="messages")
    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", cascade="all, delete")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    component = Column(Enum(ComponentType), nullable=False)
    feedback = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="feedback")


class FileMetadata(Base):
    __tablename__ = "file_metadata"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(FileMetadataType), nullable=False)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    full_path = Column(String(1024), nullable=False)
    link = Column(String(1024), nullable=True)
    uploaded_by_name = Column(String(255), nullable=True)
    uploaded_by_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    modified_at = Column(DateTime(timezone=True), nullable=True)

    workspace = relationship("Workspace", back_populates="file_metadata")
    # user = relationship("User", back_populates="file_metadata")