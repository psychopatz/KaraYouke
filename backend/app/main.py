# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from socketio import ASGIApp
from .api.youtube import router as youtube_router
from .api.session import router as session_router
from .api.user import router as user_router
from .api.queue import router as queue_router
from .sockets.socket_server import sio
import uvicorn

# Main FastAPI app
fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
fastapi_app.include_router(youtube_router, prefix="/api/youtube")
fastapi_app.include_router(session_router, prefix="/api/session")
fastapi_app.include_router(user_router, prefix="/api/user")
fastapi_app.include_router(queue_router, prefix="/api/queue") 

# Wrap with socket server
socket_app = ASGIApp(sio, other_asgi_app=fastapi_app)

if __name__ == "__main__":
    uvicorn.run("app.main:socket_app", host="0.0.0.0", port=8000, reload=True)
