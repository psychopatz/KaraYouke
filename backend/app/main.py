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

# Read DEBUG and CORS origins from env
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

# Main FastAPI app
fastapi_app = FastAPI()

# CORS middleware setup based on DEBUG value
if DEBUG:
    # In DEBUG mode, allow all origins but don't allow credentials
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins in DEBUG mode
        allow_credentials=False,  # Credentials not allowed in debug mode
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # In production, use the specified origins and allow credentials
    if origins:
        fastapi_app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,  # Allow only specific origins in production
            allow_credentials=True,  # Allow credentials in production
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        raise ValueError("ALLOWED_ORIGINS is not set in the .env file")

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
