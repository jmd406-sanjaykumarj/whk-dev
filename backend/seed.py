from sqlalchemy.orm import Session
from core.database import SessionLocal
from db.models import Workspace 
from Jlens.workspace import services, schemas
from uuid import UUID
import sys

def seed():
    print("Running seed script...")
    db: Session = SessionLocal()

    try:
        existing = db.query(Workspace).filter_by(name="WHK Contracts").first() 
        if not existing:
            print("Seeding 'WHK Contracts' workspace...")

            workspace_data = schemas.WorkspaceCreate(
                name="WHK Contracts",
                description="Contract related workspace",
                is_private=False,
                preprompt="You are an AI assistant that helps people find information."
            )

            workspace = services.create_workspace(db, user_id=None, data=workspace_data)
            print(f"Seeded workspace ID: {workspace.id}")
        else:
            print("'WHK Contracts' workspace already exists.")

        db.commit()

    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        sys.exit(1)

    finally:
        db.close()

if __name__ == "__main__":
    seed()
