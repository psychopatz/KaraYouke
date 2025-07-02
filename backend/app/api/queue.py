# File: backend/app/api/queue.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.api.session import SESSIONS
from app.sockets.socket_server import sio

router = APIRouter()

class QueueEntry(BaseModel):
    song_id: str
    title: str
    duration: str
    added_by: str
    thumbnails: List[str]

class AddSongRequest(BaseModel):
    session_code: str
    song: QueueEntry

class RemoveSongRequest(BaseModel):
    session_code: str
    song_id: str
    user_id: str  # ✅ required for validation

def validate_user(session_code: str, user_id: str):
    """Helper to check if the user is part of the session."""
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    if not any(u["id"] == user_id for u in SESSIONS[session_code]["users"]):
        raise HTTPException(status_code=403, detail="User not part of the session")

@router.post("/add", tags=["Queue"], summary="Add song to queue")
async def add_song_to_queue(data: AddSongRequest):
    validate_user(data.session_code, data.song.added_by)

    SESSIONS[data.session_code]["queue"].append(data.song.dict())

    await sio.emit("queue_updated", SESSIONS[data.session_code]["queue"], room=data.session_code)

    return {
        "status": "OK",
        "message": "Song added to queue.",
        "queue": SESSIONS[data.session_code]["queue"]
    }

@router.post("/remove", tags=["Queue"], summary="Remove song from queue by song_id")
async def remove_song_from_queue(data: RemoveSongRequest):
    validate_user(data.session_code, data.user_id)

    before = len(SESSIONS[data.session_code]["queue"])
    SESSIONS[data.session_code]["queue"] = [
        s for s in SESSIONS[data.session_code]["queue"] if s["song_id"] != data.song_id
    ]
    after = len(SESSIONS[data.session_code]["queue"])

    await sio.emit("queue_updated", SESSIONS[data.session_code]["queue"], room=data.session_code)

    return {
        "status": "OK",
        "message": f"Removed {before - after} song(s) from queue.",
        "queue": SESSIONS[data.session_code]["queue"]
    }
