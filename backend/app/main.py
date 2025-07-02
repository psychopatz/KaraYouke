from fastapi import FastAPI
from socketio import ASGIApp
from fastapi.middleware.cors import CORSMiddleware
from .api.youtube import router as youtube_router
from .api.session import router as session_router
from .api.user import router as user_router
from .sockets.socket_server import sio
import uvicorn

app = FastAPI()

# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(youtube_router, prefix="/api/youtube")
app.include_router(session_router, prefix="/api/session")
app.include_router(user_router, prefix="/api/user")

# Wrap FastAPI app with Socket.IO
socket_app = ASGIApp(sio, other_asgi_app=app)

# Only run when executed directly, not during imports
if __name__ == "__main__":
    uvicorn.run("app.main:socket_app", host="0.0.0.0", port=8000, reload=True)
