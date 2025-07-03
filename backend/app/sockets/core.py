# File: backend/app/sockets/core.py
from app.api.session import SESSIONS
from app.sockets.socket_server import sio

connected_clients = {}

@sio.event
async def connect(sid, environ):
    print("Socket connected:", sid)

@sio.event
async def disconnect(sid):
    print("Socket disconnected:", sid)
    if sid in connected_clients:
        code = connected_clients[sid]["session_code"]
        user_id = connected_clients[sid]["user_id"]

        if code in SESSIONS:
            SESSIONS[code]["users"] = [u for u in SESSIONS[code]["users"] if u["id"] != user_id]
            await sio.emit("users_updated", SESSIONS[code]["users"], room=code)

        await sio.leave_room(sid, code)
        del connected_clients[sid]

@sio.event
async def join_room(sid, session_code):
    await sio.save_session(sid, {"session_code": session_code})
    await sio.enter_room(sid, session_code)
    connected_clients[sid] = {"session_code": session_code, "user_id": None}
    print(f"Client {sid} joined room: {session_code}")

    if session_code in SESSIONS:
        await sio.emit("users_updated", SESSIONS[session_code]["users"], to=sid)

@sio.event
async def register_user(sid, data):
    if sid in connected_clients:
        connected_clients[sid]["user_id"] = data["id"]
        print(f"User {data['id']} registered on socket {sid}")

@sio.event
async def logout_user(sid, data):
    session_code = data.get("session_code")
    user_id = data.get("id")

    if session_code in SESSIONS:
        SESSIONS[session_code]["users"] = [u for u in SESSIONS[session_code]["users"] if u["id"] != user_id]
        await sio.emit("users_updated", SESSIONS[session_code]["users"], room=session_code)

    await sio.leave_room(sid, session_code)
    connected_clients.pop(sid, None)
    print(f"User {user_id} logged out from session {session_code}")
