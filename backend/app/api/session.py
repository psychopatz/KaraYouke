# File: backend/app/api/session.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code
from app.sockets.socket_server import sio
from app.state import SESSIONS

router = APIRouter()


# --- MODIFIED: Pydantic Models ---
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

# NEW: Model for the create session request body.
class CreateSessionRequest(BaseModel):
    password: str | None = None

# MODIFIED: RestoreRequest now includes the session password.
class RestoreRequest(BaseModel):
    session_code: str
    users: list[UserEntry]
    queue: list[QueueEntry]
    leaderboard: list[LeaderboardEntry]
    password: str | None = None # NEW

# --- End of Model Modifications ---


@router.get("/ping", tags=["Health"], summary="Health Check")
def ping():
    return { "status": "OK", "message": "pong" }

# MODIFIED: Endpoint now accepts a request body with an optional password.
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
        # NEW: Store the password (or None) in the session state.
        "password": request.password
    }
    print(f"Session created: {code} with password: {'set' if request.password else 'not set'}.")
    return { "status": "OK", "session_code": code }

# MODIFIED: Restore session now also restores the password.
@router.post("/restore", tags=["Session"], summary="Restore Session")
def restore_session(data: RestoreRequest):
    SESSIONS[data.session_code] = {
        "users": [user.dict() for user in data.users],
        "queue": [entry.dict() for entry in data.queue],
        "leaderboard": [entry.dict() for entry in data.leaderboard],
        "password": data.password # NEW: Restore the session password.
    }
    return {
        "status": "OK",
        "message": f"Session '{data.session_code}' restored.",
        "data": SESSIONS[data.session_code]
    }

# MODIFIED: Validate endpoint now also reports if a password is required.
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
        # A session requires a password if the 'password' field exists and is not empty.
        password_required = bool(session.get("password"))

    return { "status": "OK", "valid": is_valid, "password_required": password_required }

@router.get("/all-sessions", tags=["Debug"], summary="[Debug] Get All Active Sessions")
def get_all_sessions():
    """
    Returns the entire SESSIONS dictionary from memory.
    """
    # MODIFIED: For security, we strip passwords from the debug output.
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

    # MODIFIED: For security, don't expose password in the general details endpoint.
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