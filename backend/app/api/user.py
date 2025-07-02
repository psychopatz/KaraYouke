from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.session import SESSIONS
from app.sockets.socket_server import sio  # ✅ Import Socket.IO server

router = APIRouter()

class JoinRequest(BaseModel):
    session_code: str
    id: str
    name: str
    avatar_base64: str

@router.post("/join", tags=["User"], summary="Join Session", description="Allows a remote user to join a session by sending ID, name, and base64 avatar.")
async def join_session(user: JoinRequest):  # ✅ Make async
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

    user_entry = {
        "id": user.id,
        "name": user.name,
        "avatar_base64": user.avatar_base64
    }
    SESSIONS[code]["users"].append(user_entry)

    # ✅ Emit real-time events to all in the room (session)
    await sio.emit("join_remote", user_entry, room=code)
    await sio.emit("users_updated", SESSIONS[code]["users"], room=code)

    return {
        "status": "OK",
        "message": "User added.",
        "user": user_entry
    }
