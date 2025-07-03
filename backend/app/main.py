# backend/app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
from dotenv import load_dotenv

from .api.youtube import router as youtube_router
from .api.session import router as session_router
from .api.user import router as user_router
from .api.queue import router as queue_router
from .api.network import router as network_router
from .sockets.socket_server import sio

# Load environment variables from .env
load_dotenv()

# Read CORS origins from env
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Main FastAPI app
fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
fastapi_app.include_router(youtube_router, prefix="/api/youtube")
fastapi_app.include_router(session_router, prefix="/api/session")
fastapi_app.include_router(user_router, prefix="/api/user")
fastapi_app.include_router(queue_router, prefix="/api/queue")
fastapi_app.include_router(network_router, prefix="/api/debug")

# Socket.IO app (ASGI compatible)
socket_app = ASGIApp(sio, other_asgi_app=fastapi_app)

# Export for ASGI
app = socket_app
