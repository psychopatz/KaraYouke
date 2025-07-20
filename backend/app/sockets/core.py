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
    """Handles a client disconnection and cleans up the session."""
    print(f"Socket disconnected: {sid}")
    
    if sid in connected_clients:
        session_info = connected_clients.pop(sid, None)
        if not session_info: return # Exit if no info was found

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
                # Notify the entire room about the updated session state
                await sio.emit("session_updated", SESSIONS[code], room=code)
                print(f"User {user_id} removed from session {code} on disconnect.")


@sio.event
async def register_host(sid, session_code):
    """The host client calls this to be marked as the session's host."""
    if session_code in SESSIONS:
        SESSIONS[session_code]['host_sid'] = sid
        await sio.enter_room(sid, session_code)
        connected_clients[sid] = {"session_code": session_code, "user_id": "host"}
        print(f"Host registered with sid {sid} for session {session_code}")


@sio.event
async def join_room(sid, session_code):
    """A remote user joins a room. They will request the full state separately."""
    await sio.enter_room(sid, session_code)
    connected_clients[sid] = {"session_code": session_code, "user_id": None}
    print(f"Client {sid} joined room: {session_code}")


@sio.event
async def get_full_session(sid, session_code):
    """
    This is the primary way for a client to get the full, current state of a session.
    It's called by the frontend right after it mounts to solve the race condition.
    """
    print(f"Client {sid} requested full session info for {session_code}")
    if session_code in SESSIONS:
        # Emit the data only TO the requesting client.
        await sio.emit("session_updated", SESSIONS[session_code], to=sid)


@sio.event
async def register_user(sid, data):
    """Associates a user_id with a connected socket ID for remotes."""
    if sid in connected_clients:
        connected_clients[sid]["user_id"] = data.get("id")
        session_code = connected_clients[sid].get("session_code")
        print(f"User {data.get('id')} registered on socket {sid} for session {session_code}")
        
        # After a user is fully registered, broadcast the updated session state to everyone
        if session_code and session_code in SESSIONS:
             await sio.emit("session_updated", SESSIONS[session_code], room=session_code)


@sio.event
async def logout_user(sid, data):
    session_code = data.get("session_code")
    user_id = data.get("id")
    if session_code in SESSIONS:
        SESSIONS[session_code]["users"] = [u for u in SESSIONS[session_code]["users"] if u["id"] != user_id]
        await sio.emit("session_updated", SESSIONS[session_code], room=session_code)
    await sio.leave_room(sid, session_code)
    connected_clients.pop(sid, None)
    print(f"User {user_id} logged out from session {session_code}")


@sio.event
async def kick_user(sid, data):
    session_code = data.get("session_code")
    user_id_to_kick = data.get("id")
    sid_to_kick = None
    for s, info in connected_clients.items():
        if info.get("user_id") == user_id_to_kick and info.get("session_code") == session_code:
            sid_to_kick = s
            break
            
    if sid_to_kick:
        await sio.emit("kicked", {"message": "The host has removed you from the session."}, to=sid_to_kick)
        await sio.disconnect(sid_to_kick)
        print(f"[kick_user] Kicked user {user_id_to_kick} with sid {sid_to_kick}")
    else:
        # If the user wasn't found in connected_clients (e.g., disconnected already),
        # still ensure they are removed from the session user list and broadcast the update.
        if session_code in SESSIONS:
             SESSIONS[session_code]["users"] = [u for u in SESSIONS[session_code]["users"] if u.get("id") != user_id_to_kick]
             await sio.emit("session_updated", SESSIONS[session_code], room=session_code)
        print(f"[kick_user] Could not find sid for user {user_id_to_kick}, but ensured they were removed from user list.")