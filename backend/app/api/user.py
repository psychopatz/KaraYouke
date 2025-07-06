# File: backend/app/api/user.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.state import SESSIONS
from app.sockets.socket_server import sio 

router = APIRouter()

# MODIFIED: JoinRequest now includes an optional password field.
class JoinRequest(BaseModel):
    session_code: str
    id: str
    name: str
    avatarBase64: str | None = "/Avatars/1.svg"
    password: str | None = None # NEW: The password provided by the user trying to join.


@router.post("/join", tags=["User"], summary="Join Session")
async def join_session(user: JoinRequest):  
    code = user.session_code

    if code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    # --- NEW: Password Validation Logic ---
    session_password = SESSIONS[code].get("password")

    # Case 1: The session is password-protected.
    if session_password:
        # Check if the provided password matches the session's password.
        if user.password != session_password:
            # If passwords do not match, reject the request with 403 Forbidden.
            raise HTTPException(status_code=403, detail="Invalid password for this session.")
            
    # Case 2: The session is not password-protected (session_password is None or empty).
    # The request is allowed to proceed without a password check.
    # --- END: Password Validation Logic ---

    existing = [u for u in SESSIONS[code]["users"] if u["id"] == user.id]
    if existing:
        return {
            "status": "OK",
            "message": "User already joined.",
            "user": existing[0]
        }

    user_entry = {
        "id": user.id,
        "name": user.name,
        "avatarBase64": user.avatarBase64 or "/Avatars/1.svg"
    }
    SESSIONS[code]["users"].append(user_entry)

    await sio.emit("join_remote", user_entry, room=code)
    await sio.emit("session_updated", SESSIONS[code], room=code)

    return {
        "status": "OK",
        "message": "User added.",
        "user": user_entry
    }