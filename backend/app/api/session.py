# File: backend/app/api/session.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code
# NEW: Import the socket instance to be able to emit events
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
    singer: str = "" # Note: This field exists in your model

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
        "leaderboard": []
    }
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

@router.get("/{session_code}", tags=["Session"], summary="Get Session Details")
def get_session_details(session_code: str):
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "status": "OK",
        "session_code": session_code,
        "data": SESSIONS[session_code]
    }

# --- NEW ENDPOINT ADDED BELOW ---

@router.delete("/{session_code}", tags=["Session"], summary="Delete a Session")
async def delete_session(session_code: str):
    """
    Removes a session from memory and notifies connected clients via WebSocket.
    """
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Notify all clients in the room that the session is ending.
    #    This is crucial for a good user experience on the remote clients.
    await sio.emit("session_deleted", {"message": "The host has ended the session."}, room=session_code)
    
    # 2. Remove the session from the global dictionary in memory.
    SESSIONS.pop(session_code, None)
    
    # 3. Log the action on the server for debugging.
    print(f"Session '{session_code}' has been deleted.")
    
    # 4. Return a success response to the client that made the DELETE request.
    return {
        "status": "OK",
        "message": f"Session '{session_code}' deleted successfully."
    }