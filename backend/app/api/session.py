from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code

router = APIRouter()

SESSIONS = {}

class RestoreRequest(BaseModel):
    session_code: str
    users: list[dict]
    queue: list[dict]
    leaderboard: list[dict]

@router.get("/ping", tags=["Health"], summary="Health Check", description="Returns 'pong' to confirm the backend server is reachable.")
def ping():
    return {
        "status": "OK",
        "message": "pong"
    }

@router.post("/create", tags=["Session"], summary="Create Session", description="Generates a new session code and initializes in-memory session storage.")
def create_session():
    code = generate_session_code()
    SESSIONS[code] = {
        "users": [],
        "queue": [],
        "leaderboard": []
    }
    return {
        "status": "OK",
        "session_code": code
    }

@router.post("/restore", tags=["Session"], summary="Restore Session", description="Restores a session state from the monitor's sessionStorage including users, queue, and scores.")
def restore_session(data: RestoreRequest):
    SESSIONS[data.session_code] = {
        "users": data.users,
        "queue": data.queue,
        "leaderboard": data.leaderboard
    }
    return {
        "status": "OK",
        "message": f"Session '{data.session_code}' restored.",
        "data": SESSIONS[data.session_code]
    }

@router.get("/{session_code}", tags=["Session"], summary="Get Session Details", description="Returns full session details including all users, song queue, and leaderboard.")
def get_session_details(session_code: str):
    if session_code not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "status": "OK",
        "session_code": session_code,
        "data": SESSIONS[session_code]
    }

