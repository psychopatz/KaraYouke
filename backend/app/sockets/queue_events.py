# File: backend/app/sockets/queue_events.py
from app.sockets.socket_server import sio
from app.state import SESSIONS


@sio.event
async def add_song(sid, data):
    session_code = data.get("session_code")
    song = data.get("song")

    if session_code not in SESSIONS:
        return

    user_ids = [u["id"] for u in SESSIONS[session_code]["users"]]
    if song["added_by"] not in user_ids:
        print("Unauthorized add_song attempt.")
        return

    SESSIONS[session_code]["queue"].append(song)
    await sio.emit("queue_updated", SESSIONS[session_code]["queue"], room=session_code)
    print(f"Song added by {song['added_by']} to {session_code}")

@sio.event
async def remove_song(sid, data):
    session_code = data.get("session_code")
    song_id = data.get("song_id")
    user_id = data.get("user_id")

    if session_code not in SESSIONS:
        return

    user_ids = [u["id"] for u in SESSIONS[session_code]["users"]]
    if user_id not in user_ids:
        print("Unauthorized remove_song attempt.")
        return

    before = len(SESSIONS[session_code]["queue"])
    SESSIONS[session_code]["queue"] = [
        s for s in SESSIONS[session_code]["queue"] if s["song_id"] != song_id
    ]
    after = len(SESSIONS[session_code]["queue"])
    print(f"User {user_id} removed song {song_id} from {session_code}: {before} → {after}")

    await sio.emit("queue_updated", SESSIONS[session_code]["queue"], room=session_code)
