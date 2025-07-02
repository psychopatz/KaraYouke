# File: backend/app/api/session.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.session_code_utils import generate_session_code

router = APIRouter()

SESSIONS = {}

class UserEntry(BaseModel):
    id: str
    name: str
    avatar_base64: str

class QueueEntry(BaseModel):
    # Define your queue structure here if needed
    song_id: str = ""
    title: str = ""
    singer: str = ""

class LeaderboardEntry(BaseModel):
    # Define your leaderboard structure here if needed
    id: str
    name: str
    score: int

class RestoreRequest(BaseModel):
    session_code: str
    users: list[UserEntry]
    queue: list[QueueEntry]
    leaderboard: list[LeaderboardEntry]

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
        "users": [user.dict() for user in data.users],
        "queue": [entry.dict() for entry in data.queue],
        "leaderboard": [entry.dict() for entry in data.leaderboard]
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
