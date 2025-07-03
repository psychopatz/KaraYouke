# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
from .api.youtube import router as youtube_router
from .api.session import router as session_router
from .api.user import router as user_router
from .api.queue import router as queue_router
from .api.network import router as network_router
from .sockets.socket_server import sio

# Main FastAPI app
fastapi_app = FastAPI()

# CORS for Vercel + local dev + Render domains
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://karayouke.vercel.app",
        "http://localhost:5173",          # Vite dev frontend
        "https://karayouke.onrender.com"  # optional, if frontend served here
    ],
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

# Export `socket_app` as the ASGI app for Render
app = socket_app
