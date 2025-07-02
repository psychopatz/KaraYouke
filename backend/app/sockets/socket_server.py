# backend/app/sockets/socket_server.py
import socketio

sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:5173"],  # match frontend dev server
    async_mode="asgi"
)

connected_clients = {}

@sio.event
async def connect(sid, environ):
    print("Socket connected:", sid)

@sio.event
async def disconnect(sid):
    print("Socket disconnected:", sid)
    if sid in connected_clients:
        del connected_clients[sid]

@sio.event
async def join_room(sid, session_code):
    await sio.save_session(sid, {"session_code": session_code})
    await sio.enter_room(sid, session_code)
    connected_clients[sid] = session_code
    print(f"Client {sid} joined room: {session_code}")
