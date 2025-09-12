from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router
from Jlens.workspace.routes import router as workspace_router
from Jlens.user_access.routes import router as user_access_router
from Jlens.conversations.routes import router as conversation_router
from Jlens.messages.routes import router as messages_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(workspace_router, prefix="/api")
app.include_router(user_access_router, prefix="/api")
app.include_router(conversation_router, prefix="/api")
app.include_router(messages_router, prefix="/api")

@app.get("/health")
def healthcheck():
    print("/health exe")
    return "OK ??????!!!!!!!"
