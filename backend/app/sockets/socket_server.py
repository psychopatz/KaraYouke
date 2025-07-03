# File: backend/app/sockets/socket_server.py
import socketio

sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode="asgi"
)

# Import all socket event handlers
from . import core, queue_events  # Registers events via decorators
