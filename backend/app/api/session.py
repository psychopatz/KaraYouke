# File: backend/app/api/session.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code
from app.sockets.socket_server import sio
from app.state import SESSIONS

router = APIRouter()


class UserEntry(BaseModel):
    id: str
    name: str
    avatarBase64: str

class QueueEntry(BaseModel):
    song_id: str = ""
    title: str = ""
    singer: str = "" 

class LeaderboardEntry(BaseModel):
    id: str
    name: str
    score: int

class RestoreRequest(BaseModel):
    session_code: str
    users: list[UserEntry]
    queue: list[QueueEntry]
    leaderboard: list[LeaderboardEntry]

@router.get("/ping", tags=["Health"], summary="Health Check")
def ping():
    return { "status": "OK", "message": "pong" }

@router.post("/create", tags=["Session"], summary="Create Session")
def create_session():
    code = generate_session_code()
    SESSIONS[code] = {
        "users": [],
        "queue": [],
        "leaderboard": [],
        "settings": {
            "showScore": True
        }
    }
    print(f"Session created: {code} with default settings.")
    return { "status": "OK", "session_code": code }

@router.post("/restore", tags=["Session"], summary="Restore Session")
def restore_session(data: RestoreRequest):
    SESSIONS[data.session_code] = {
        "users": [user.dict() for user in data.users],
        "queue": [entry.dict() for entry in data.queue],
        "leaderboard": [entry.dict() for entry in data.leaderboard]
    }
    return {
        "status": "OK",
        "message": f"Session '{data.session_code}' restored.",
        "data": SESSIONS[data.session_code]
    }

@router.get("/validate/{session_code}", tags=["Session"], summary="Validate Session Existence")
def validate_session_existence(session_code: str):
    """
    Checks if a session code exists in the server's memory.
    Returns a simple boolean status.
    """
    is_valid = session_code in SESSIONS
    return { "status": "OK", "valid": is_valid }


# ✅ --- FIX: The specific, static route is now DEFINED BEFORE the dynamic route ---
@router.get("/all-sessions", tags=["Debug"], summary="[Debug] Get All Active Sessions")
def get_all_sessions():
    """
    Returns the entire SESSIONS dictionary from memory.
    Useful for developers to inspect the current state of all sessions.
    """
    return {
        "status": "OK",
        "sessions_count": len(SESSIONS),
        "data": SESSIONS
    }

@router.get("/{session_code}", tags=["Session"], summary="Get Session Details")
def get_session_details(session_code: str):
    """
    This dynamic route will now only be matched if the path is not '/all-sessions'.
    """
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "status": "OK",
        "session_code": session_code,
        "data": SESSIONS[session_code]
    }

@router.delete("/{session_code}", tags=["Session"], summary="Delete a Session")
async def delete_session(session_code: str):
    """
    Removes a session from memory and notifies connected clients via WebSocket.
    """
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    await sio.emit("session_deleted", {"message": "The host has ended the session."}, room=session_code)
    SESSIONS.pop(session_code, None)
    print(f"Session '{session_code}' has been deleted.")
    
    return {
        "status": "OK",
        "message": f"Session '{session_code}' deleted successfully."
    }