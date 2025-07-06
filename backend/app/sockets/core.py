# File: backend/app/sockets/core.py
from app.sockets.socket_server import sio
from app.state import SESSIONS

# A simple in-memory dictionary to track connected clients and their associated data.
# { sid: { "session_code": str, "user_id": str | None } }
connected_clients = {}

@sio.event
async def connect(sid, environ):
    """Handles a new client connection."""
    print(f"Socket connected: {sid}")

@sio.event
async def disconnect(sid):
    """Handles a client disconnection."""
    print(f"Socket disconnected: {sid}")
    
    if sid in connected_clients:
        session_info = connected_clients[sid]
        code = session_info.get("session_code")
        user_id = session_info.get("user_id")

        if code and code in SESSIONS:
            # Check if the disconnected user was the host
            if SESSIONS[code].get("host_sid") == sid:
                print(f"Host {sid} disconnected from session {code}. Notifying room and deleting session.")
                # Notify all remaining clients that the session is over.
                await sio.emit("session_deleted", {"message": "The host has disconnected and the session has ended."}, room=code)
                # Clean up the session from memory
                SESSIONS.pop(code, None)
            
            # If a regular user disconnected
            elif user_id:
                # Remove the user from the session's user list
                SESSIONS[code]["users"] = [u for u in SESSIONS[code]["users"] if u.get("id") != user_id]
                # Notify the room about the updated user list
                await sio.emit("users_updated", SESSIONS[code]["users"], room=code)
                print(f"User {user_id} removed from session {code} on disconnect.")

        # Clean up the client tracking dictionary
        del connected_clients[sid]

@sio.event
async def register_host(sid, session_code):
    """
    The host client calls this event after creating a session or reconnecting.
    This officially marks the client as the session's host.
    """
    if session_code in SESSIONS:
        SESSIONS[session_code]['host_sid'] = sid
        await sio.enter_room(sid, session_code)
        # Store tracking info for this client
        connected_clients[sid] = {"session_code": session_code, "user_id": "host"}
        print(f"Host registered with sid {sid} for session {session_code}")
    else:
        print(f"Warning: Host {sid} tried to register for non-existent session {session_code}")
        # Optionally, tell the client the session is invalid
        await sio.emit("session_invalid", to=sid)


@sio.event
async def join_room(sid, session_code):
    """A remote user joins a room."""
    await sio.enter_room(sid, session_code)
    # Store minimal tracking info; user_id will be added by register_user
    connected_clients[sid] = {"session_code": session_code, "user_id": None}
    print(f"Client {sid} joined room: {session_code}")

    if session_code in SESSIONS:
        # When a new remote joins, send them the full current user list
        await sio.emit("users_updated", SESSIONS[session_code]["users"], to=sid)

@sio.event
async def get_session_info(sid, session_code):
    """
    On request from any client, send them the current state of the session.
    """
    print(f"Client {sid} requested initial info for session {session_code}")
    if session_code in SESSIONS:
        session_data = SESSIONS[session_code]
        # Emit the data only TO the requesting client.
        await sio.emit("queue_updated", session_data.get("queue", []), to=sid)
        await sio.emit("users_updated", session_data.get("users", []), to=sid)

@sio.event
async def register_user(sid, data):
    """Associates a user_id with a connected socket ID for remotes."""
    if sid in connected_clients:
        connected_clients[sid]["user_id"] = data.get("id")
        session_code = connected_clients[sid].get("session_code")
        print(f"User {data.get('id')} registered on socket {sid} for session {session_code}")
        
        # After a user is fully registered, broadcast the updated user list to everyone
        if session_code and session_code in SESSIONS:
             await sio.emit("users_updated", SESSIONS[session_code]["users"], room=session_code)

# (The rest of your event handlers like logout_user and kick_user remain the same)
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
        await logout_user(sid_to_kick, {"session_code": session_code, "id": user_id})
        await sio.disconnect(sid_to_kick)
        print(f"[kick_user] Kicked user {user_id} with sid {sid_to_kick}")
    else:
        print(f"[kick_user] Could not find sid for user {user_id}")