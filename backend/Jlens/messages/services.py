from sqlalchemy.orm import Session
import os
from uuid import UUID
from db.models import Message, Conversation
from .schemas import MessageCreate, MessageOut
from datetime import datetime
from dateutil.relativedelta import relativedelta
from openai import AzureOpenAI
from openai.types.chat import ChatCompletionMessageParam
from dotenv import load_dotenv
import json
import httpx
from db.models import ChatType
from fastapi import HTTPException
import time
import requests
from fastapi.responses import Response
from fastapi.responses import StreamingResponse
from openai.types.chat import ChatCompletionMessageParam
from typing import Optional, List, Tuple
from db.models import Workspace, User

# import pika

load_dotenv()
#RabbitMQ configuration
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
#OpenAI configuration
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_MODEL_NAME_1")
AZURE_OPENAI_RESOURCE = os.getenv("AZURE_OPENAI_RESOURCE")
AZURE_OPENAI_PREVIEW_API_VERSION = os.getenv("AZURE_OPENAI_PREVIEW_API_VERSION", "2024-05-01-preview")

#Azure Search configuration
AZURE_SEARCH_QUERY_TYPE = os.getenv("AZURE_SEARCH_QUERY_TYPE", "simple")
AZURE_SEARCH_USE_SEMANTIC_SEARCH = os.getenv("AZURE_SEARCH_USE_SEMANTIC_SEARCH", "false")
AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG = os.getenv("AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG", "")
AZURE_OPENAI_TEMPERATURE = os.getenv("AZURE_OPENAI_TEMPERATURE", "0.7")
AZURE_OPENAI_MAX_TOKENS = os.getenv("AZURE_OPENAI_MAX_TOKENS", "1000")
AZURE_OPENAI_TOP_P = os.getenv("AZURE_OPENAI_TOP_P", "1.0")
AZURE_OPENAI_STOP_SEQUENCE = os.getenv("AZURE_OPENAI_STOP_SEQUENCE", "")
AZURE_SEARCH_SERVICE = os.getenv("AZURE_SEARCH_SERVICE")
AZURE_SEARCH_KEY = os.getenv("AZURE_SEARCH_KEY")
AZURE_SEARCH_CONTENT_COLUMNS = os.getenv("AZURE_SEARCH_CONTENT_COLUMNS", "")
AZURE_SEARCH_TITLE_COLUMN = os.getenv("AZURE_SEARCH_TITLE_COLUMN", "")
AZURE_SEARCH_URL_COLUMN = os.getenv("AZURE_SEARCH_URL_COLUMN", "")
AZURE_SEARCH_FILENAME_COLUMN = os.getenv("AZURE_SEARCH_FILENAME_COLUMN", "")
AZURE_SEARCH_VECTOR_COLUMNS = os.getenv("AZURE_SEARCH_VECTOR_COLUMNS", "")
AZURE_SEARCH_TOP_K = int(os.getenv("AZURE_SEARCH_TOP_K", 5))
# AZURE_OPENAI_SYSTEM_MESSAGE = os.getenv("AZURE_OPENAI_SYSTEM_MESSAGE", "You are a helpful assistant.")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.getenv("AZURE_OPENAI_EMBEDDING_ENDPOINT")
AZURE_OPENAI_EMBEDDING_KEY = os.getenv("AZURE_OPENAI_EMBEDDING_KEY")
AZURE_SEARCH_STRICTNESS = os.getenv("AZURE_SEARCH_STRICTNESS", "0")

def load_system_message(filename: str = "context.txt") -> str:
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../", filename))
    try:
        with open(path, "r", encoding="utf-8") as f:
            system_message = f.read().strip()
        current_date = datetime.today().strftime("%d/%m/%Y")
        three_months_later = (datetime.today() + relativedelta(months=3)).strftime("%d/%m/%Y")
        system_message = system_message.replace("{{CURRENT_DATE}}", current_date)
        system_message = system_message.replace("{{THREE_MONTHS_LATER}}", three_months_later)
        return system_message
    except Exception:
        return "You are a helpful assistant."

AZURE_OPENAI_SYSTEM_MESSAGE = load_system_message()

httpx_client = httpx.Client(
    base_url=AZURE_OPENAI_ENDPOINT,
    headers={"api-key": AZURE_OPENAI_KEY},
    timeout=180.0,
)

client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    api_version="2024-05-01-preview",
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
    http_client=httpx_client,
)

def create_message(db: Session, user_id: UUID, msg_data: MessageCreate) -> Message:
    # if msg_data.conversation_id:
    #     # Use existing conversation
    #     conversation = db.query(Conversation).filter_by(id=msg_data.conversation_id).first()
    #     if not conversation:
    #         raise HTTPException(status_code=404, detail="Conversation not found")
    # else:
    #     if not msg_data.component_type:
    #         raise HTTPException(status_code=400, detail="Conversation type is required for first message")
    #     conversation = Conversation(
    #         title="Untitled",
    #         user_id=user_id,
    #         workspace_id=msg_data.workspace_id,
    #         component_type=msg_data.component_type
    #     )
    #     db.add(conversation)
    #     db.commit()
    #     db.refresh(conversation)
    conversation = db.query(Conversation).filter_by(id=msg_data.conversation_id).first()

    msg = Message(
        conversation_id=conversation.id,
        workspace_id=msg_data.workspace_id,
        user_id=user_id,
        content=msg_data.content,
        role=msg_data.role,
        model_type=msg_data.model_type,
        chat_type=ChatType(msg_data.chat_type) if msg_data.chat_type else ChatType.standalone,
        input_tokens=msg_data.input_tokens,
        output_tokens=msg_data.output_tokens,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    msg_count = db.query(Message).filter_by(conversation_id=msg_data.conversation_id).count()
    if msg_count == 1 and msg.role == "user":
        first_msg = {"role": msg.role, "content": msg.content}
        conversation.title = generate_title(first_msg)
        db.commit()

    return msg

def create_model_message(
    db: Session,
    user_id: UUID,
    workspace_id: UUID,
    conversation_id: UUID,
    content: str,
    model_type: str,
    chat_type: ChatType,
    role: str = "assistant" 
) -> Message:
    msg = Message(
        conversation_id=conversation_id,
        workspace_id=workspace_id,
        user_id=user_id,
        content=content,
        role=role,
        model_type=model_type,
        chat_type=ChatType(chat_type),
        input_tokens=0,
        output_tokens=0
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def generate_title(first_message: dict) -> str:
    """
    Generate a short title (≤ 4 words) from the first user message.
    """
    title_prompt = (
        "Summarize the following message into a 4-word or fewer title. "
        "Do not use punctuation or quotes. Return only a JSON like: {\"title\": \"...\"}."
    )

    messages: list[ChatCompletionMessageParam] = [
        {"role": first_message["role"], "content": first_message["content"]},
        {"role": "user", "content": title_prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT,
            messages=messages,
            temperature=0.7,
            max_tokens=20,
        )
        content = response.choices[0].message.content
        title = json.loads(content).get("title", "Untitled")
        return title

    except Exception as e:
        print("Title generation failed:", e)
        return "Untitled"
    
def get_messages_by_conversation(db: Session, conversation_id: UUID):
    return (
        db.query(Message)
        .filter_by(conversation_id=conversation_id)
        .order_by(Message.created_at)
        .all()
    )


def conversation_with_data(db: Session, user_msg: MessageOut, user_id: UUID, message: MessageCreate):
    messages_db = get_messages_by_conversation(db, user_msg.conversation_id)
    messages: List[dict] = [
        {"role": msg.role, "content": msg.content} for msg in messages_db if msg.role != "tool"
    ]
 
    def token_stream():
        url = (
            f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/extensions/chat/completions"
            f"?api-version=2023-06-01-preview"
        )
 
        headers = {
            "api-key": AZURE_OPENAI_KEY,
            "Content-Type": "application/json"
        }
 
        body = {
            "messages": messages,
            "temperature": float(AZURE_OPENAI_TEMPERATURE),
            "max_tokens": int(AZURE_OPENAI_MAX_TOKENS),
            "top_p": float(AZURE_OPENAI_TOP_P),
            "stop": None,
            "stream": True,
            "dataSources": [
                {
                    "type": "AzureCognitiveSearch",
                    "parameters": {
                        "endpoint": f"https://{AZURE_SEARCH_SERVICE}.search.windows.net",
                        "key": AZURE_SEARCH_KEY,
                        "indexName": "whk-contract-azureblob-index",
                        "fieldsMapping": {
                            "contentFields": AZURE_SEARCH_CONTENT_COLUMNS.split(",") if AZURE_SEARCH_CONTENT_COLUMNS else [],
                            "titleField": AZURE_SEARCH_TITLE_COLUMN,
                            # "urlField": AZURE_SEARCH_URL_COLUMN,
                            "filepathField": AZURE_SEARCH_FILENAME_COLUMN,
                            # "vectorFields": AZURE_SEARCH_VECTOR_COLUMNS.split(",") if AZURE_SEARCH_VECTOR_COLUMNS else [],
                        },
                        "inScope": True,
                        "topNDocuments": AZURE_SEARCH_TOP_K,
                        "queryType": AZURE_SEARCH_QUERY_TYPE,
                        "semanticConfiguration": AZURE_SEARCH_SEMANTIC_SEARCH_CONFIG,
                        "roleInformation": load_system_message(),
                        # "embeddingEndpoint": AZURE_OPENAI_EMBEDDING_ENDPOINT,
                        # "embeddingKey": AZURE_OPENAI_EMBEDDING_KEY,
                        "filter": "",
                        # f"group_name eq '{group_name}'" if current_workspace.name != "Jman Sales" else "",
                        "strictness": int(AZURE_SEARCH_STRICTNESS),
                    }
                }
            ]
        }
 
        collected_response = ""
        tool_response = ""
 
        try:
            with httpx.stream("POST", url, headers=headers, json=body, timeout=None) as response:
                if response.status_code != 200:
                    print("Error:", response.text)
                    raise HTTPException(status_code=response.status_code, detail="Failed to get streaming response")
 
                for raw_line in response.iter_lines():
                    if not raw_line:
                        continue
 
                    line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                    print("Raw line:", line)
 
                    line = line.strip()
                    if not line.startswith("data:"):
                        continue
 
                    content = line[5:].strip()
                    print("Parsed content:", content)
 
                    if content == "[DONE]":
                        break
 
                    try:
                        delta = json.loads(content)
                        choice = delta.get("choices", [{}])[0]
                        stream_messages = choice.get("messages", [])
 
                        for msg in stream_messages:
                            inner_delta = msg.get("delta", {})
                            role = inner_delta.get("role", "")
                            token = inner_delta.get("content", "")
 
                            if role == "tool":
                                print("Tool token:", token)
                                tool_response += token
                            elif token:
                                print("Assistant token:", token)
                                collected_response += token
                                yield token
                    except Exception as e:
                        print("JSON decode or processing error:", e, content)
                        continue
 
            # Save assistant message
            if collected_response.strip():
                print("Saving assistant response...")
                create_model_message(
                    db=db,
                    user_id=user_id,
                    workspace_id=message.workspace_id,
                    conversation_id=user_msg.conversation_id,
                    content=collected_response,
                    model_type=message.model_type,
                    chat_type=ChatType(message.chat_type),
                )
 
            # Save tool (citation) message if present
            if tool_response.strip():
                print("Saving tool message...")
                try:
                    tool_pretty = json.dumps(json.loads(tool_response), indent=2)
                except Exception:
                    tool_pretty = tool_response
 
                create_model_message(
                    db=db,
                    user_id=user_id,
                    workspace_id=message.workspace_id,
                    conversation_id=user_msg.conversation_id,
                    content=tool_pretty,
                    model_type=message.model_type,
                    chat_type=ChatType(message.chat_type),
                    role="tool"
                )
 
        except Exception as e:
            print("Stream error:", e)
            raise HTTPException(status_code=500, detail="Failed to stream model response")
 
    return StreamingResponse(token_stream(), media_type="text/event-stream")
 
 
def conversation_without_data(db: Session, user_msg: MessageOut, user_id: UUID, message: MessageCreate):
    messages_db = get_messages_by_conversation(db, user_msg.conversation_id)
    messages: list[ChatCompletionMessageParam] = [
        {"role": "system", "content": load_system_message()},  
        *(
            {"role": msg.role, "content": msg.content}
            for msg in messages_db if msg.role != "tool"
        )
    ]
    def token_stream():
        try:
            stream = client.chat.completions.create(
                model=AZURE_OPENAI_DEPLOYMENT,
                messages=messages,
                temperature=float(AZURE_OPENAI_TEMPERATURE),
                max_tokens=int(AZURE_OPENAI_MAX_TOKENS),
                stream=True
            )

            collected_response = ""
            for chunk in stream:
                if not chunk.choices:
                    continue

                choice = chunk.choices[0]

                if hasattr(choice.delta, "content"):
                    delta = choice.delta.content or ""
                    collected_response += delta
                    yield f"data: {delta}\n\n"

            print("Final collected response:", collected_response)
            model_msg = create_model_message(
                db=db,
                user_id=user_id,
                workspace_id=message.workspace_id,
                conversation_id=user_msg.conversation_id,
                content=collected_response,
                model_type=message.model_type,
                chat_type=ChatType(message.chat_type),
            )

        except Exception as e:
            print("Stream error:", e)
            raise HTTPException(status_code=500, detail="Failed to stream model response")

    return StreamingResponse(token_stream(), media_type="text/event-stream")

def get_last_user_message(db: Session, conversation_id: UUID):
    last_user_msg = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id, Message.role == "user")
        .order_by(Message.created_at.desc())
        .first()
    )

    if not last_user_msg:
        raise HTTPException(status_code=404, detail="User message not found in conversation")

    return last_user_msg