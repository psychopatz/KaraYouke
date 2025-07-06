# File: backend/app/sockets/socket_server.py
import socketio
import os
# ❌ --- REMOVE THESE ---
# from dotenv import load_dotenv
# load_dotenv()

# This code now runs AFTER main.py has loaded the environment.
# It will correctly find the ALLOWED_ORIGINS variable.
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
print(f"✅ Socket.IO server configured with origins: {allowed_origins}") # Helpful debug print

# The server is now created with the correct configuration
sio = socketio.AsyncServer(
    cors_allowed_origins=allowed_origins,
    async_mode="asgi"
)

# Import all socket event handlers
from . import core, queue_events,player_events,settings_events 