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
        code = connected_clients[sid].get("session_code")
        user_id = connected_clients[sid].get("user_id")

        if code and user_id and code in SESSIONS:
            SESSIONS[code]["users"] = [u for u in SESSIONS[code]["users"] if u["id"] != user_id]
            await sio.emit("users_updated", SESSIONS[code]["users"], room=code)
            print(f"User {user_id} removed from session {code} on disconnect.")

        if code:
          await sio.leave_room(sid, code)
        
        del connected_clients[sid]

@sio.event
async def join_room(sid, session_code):
    await sio.enter_room(sid, session_code)
    # Storing session_code here is good for disconnect logic
    connected_clients[sid] = {"session_code": session_code, "user_id": None}
    print(f"Client {sid} joined room: {session_code}")

    # --- CHANGED: Broadcast to the whole room ---
    # When a user joins, notify EVERYONE in the room so their lists update.
    # The new user was added to SESSIONS via the HTTP API call *before* this.
    if session_code in SESSIONS:
        await sio.emit("users_updated", SESSIONS[session_code]["users"], room=session_code)


# --- NEW: This is the critical handler you were missing ---
@sio.event
async def get_session_info(sid, session_code):
    """
    On request from a client, send them the current state of the session.
    This populates the UI when they first load the page.
    """
    print(f"Client {sid} requested initial info for session {session_code}")
    if session_code in SESSIONS:
        session_data = SESSIONS[session_code]
        # Emit the data only TO the requesting client.
        await sio.emit("queue_updated", session_data["queue"], to=sid)
        await sio.emit("users_updated", session_data["users"], to=sid)


@sio.event
async def register_user(sid, data):
    if sid in connected_clients:
        connected_clients[sid]["user_id"] = data["id"]
        print(f"User {data['id']} registered on socket {sid}")
        # Optional: You could re-broadcast user list here for extra certainty
        # session_code = connected_clients[sid]["session_code"]
        # if session_code in SESSIONS:
        #     await sio.emit("users_updated", SESSIONS[session_code]["users"], room=session_code)


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

@sio.event
async def kick_user(sid, data):
    session_code = data.get("session_code")
    user_id = data.get("id")

    sid_to_kick = None
    for s, info in connected_clients.items():
        if info.get("user_id") == user_id and info.get("session_code") == session_code:
            sid_to_kick = s
            break

    if sid_to_kick:
        # Re-use your logout logic to perform the kick
        await logout_user(sid_to_kick, {"session_code": session_code, "id": user_id})
        # Disconnect the socket connection of the kicked user
        await sio.disconnect(sid_to_kick)
        print(f"[kick_user] Kicked user {user_id} with sid {sid_to_kick}")
    else:
        print(f"[kick_user] Could not find sid for user {user_id}")