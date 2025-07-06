from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.state import SESSIONS
from app.sockets.socket_server import sio 

router = APIRouter()

class JoinRequest(BaseModel):
    session_code: str
    id: str
    name: str
    # --- THIS IS THE FIX ---
    # 1. We make the field optional by adding `| None`.
    # 2. We provide a default value if the frontend doesn't send it at all.
    avatarBase64: str | None = "/Avatars/1.svg"


@router.post("/join", tags=["User"], summary="Join Session")
async def join_session(user: JoinRequest):  
    code = user.session_code

    if code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    existing = [u for u in SESSIONS[code]["users"] if u["id"] == user.id]
    if existing:
        return {
            "status": "OK",
            "message": "User already joined.",
            "user": existing[0]
        }

    # If the avatar was missing and the default was used, ensure it's in the entry.
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