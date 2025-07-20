# File: backend/app/api/session.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code
from app.sockets.socket_server import sio
from app.state import SESSIONS

router = APIRouter()


# --- Pydantic Models ---
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

class CreateSessionRequest(BaseModel):
    password: str | None = None

class RestoreRequest(BaseModel):
    session_code: str
    users: list[UserEntry]
    queue: list[QueueEntry]
    leaderboard: list[LeaderboardEntry]
    password: str | None = None

# --- End of Models ---


@router.get("/ping", tags=["Health"], summary="Health Check")
def ping():
    return { "status": "OK", "message": "pong" }

@router.post("/create", tags=["Session"], summary="Create Session")
def create_session(request: CreateSessionRequest):
    code = generate_session_code()
    SESSIONS[code] = {
        "users": [],
        "queue": [],
        "leaderboard": [],
        "settings": {
            "showScore": True
        },
        "password": request.password,
        # The new flag to track if the session is live
        "is_started": False
    }
    print(f"Session created: {code} with password: {'set' if request.password else 'not set'}.")
    return { "status": "OK", "session_code": code }

@router.post("/restore", tags=["Session"], summary="Restore Session")
def restore_session(data: RestoreRequest):
    # When restoring, we preserve the 'is_started' state if it exists, otherwise default to False
    SESSIONS[data.session_code] = {
        "users": [user.dict() for user in data.users],
        "queue": [entry.dict() for entry in data.queue],
        "leaderboard": [entry.dict() for entry in data.leaderboard],
        "password": data.password,
        "is_started": SESSIONS.get(data.session_code, {}).get("is_started", False)
    }
    return {
        "status": "OK",
        "message": f"Session '{data.session_code}' restored.",
        "data": SESSIONS[data.session_code]
    }

@router.get("/validate/{session_code}", tags=["Session"], summary="Validate Session Existence")
def validate_session_existence(session_code: str):
    """
    Checks if a session code exists and if it requires a password.
    This helps the frontend decide whether to show a password input field.
    """
    session = SESSIONS.get(session_code)
    is_valid = session is not None
    password_required = False

    if is_valid:
        password_required = bool(session.get("password"))

    return { "status": "OK", "valid": is_valid, "password_required": password_required }

@router.get("/all-sessions", tags=["Debug"], summary="[Debug] Get All Active Sessions")
def get_all_sessions():
    """
    Returns the entire SESSIONS dictionary from memory.
    """
    # For security, we strip passwords from the debug output.
    sessions_without_passwords = {}
    for code, data in SESSIONS.items():
        session_copy = data.copy()
        session_copy.pop("password", None) 
        sessions_without_passwords[code] = session_copy

    return {
        "status": "OK",
        "sessions_count": len(SESSIONS),
        "data": sessions_without_passwords
    }

@router.get("/{session_code}", tags=["Session"], summary="Get Session Details")
def get_session_details(session_code: str):
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    # For security, don't expose password in the general details endpoint.
    session_data = SESSIONS[session_code].copy()
    session_data.pop("password", None)

    return {
        "status": "OK",
        "session_code": session_code,
        "data": session_data
    }

@router.delete("/{session_code}", tags=["Session"], summary="Delete a Session")
async def delete_session(session_code: str):
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    await sio.emit("session_deleted", {"message": "The host has ended the session."}, room=session_code)
    SESSIONS.pop(session_code, None)
    print(f"Session '{session_code}' has been deleted.")
    
    return {
        "status": "OK",
        "message": f"Session '{session_code}' deleted successfully."
    }