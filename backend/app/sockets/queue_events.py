# File: backend/app/sockets/queue_events.py
from app.sockets.socket_server import sio
from app.state import SESSIONS
import uuid  # <-- ADD THIS IMPORT

@sio.event
async def add_song(sid, data):
    session_code = data.get("session_code")
    song = data.get("song")

    if session_code not in SESSIONS:
        return

    # Ensure the user adding the song is part of the session
    user_ids = [u["id"] for u in SESSIONS[session_code]["users"]]
    if song.get("added_by") not in user_ids:
        print(f"Unauthorized add_song attempt by unknown user in session {session_code}")
        return

    # ✅ --- FIX: Add a unique ID to every queue entry ---
    # This ID is unique to this specific entry in the queue, even if the song is a duplicate.
    song['queue_id'] = str(uuid.uuid4())

    SESSIONS[session_code]["queue"].append(song)
    await sio.emit("queue_updated", SESSIONS[session_code]["queue"], room=session_code)
    print(f"Song added by {song['added_by']} to {session_code} (queue_id: {song['queue_id']})")

@sio.event
async def remove_song(sid, data):
    session_code = data.get("session_code")
    # ✅ --- FIX: We now use the unique `queue_id` to identify the song to remove ---
    queue_id = data.get("queue_id")
    user_id = data.get("user_id")

    if not all([session_code, queue_id, user_id]):
        print("Invalid remove_song request: missing data.")
        return

    if session_code not in SESSIONS:
        return

    # Check if user is authorized (can be host or the user who added it)
    queue = SESSIONS[session_code]["queue"]
    song_to_remove = next((s for s in queue if s.get("queue_id") == queue_id), None)
    
    # Simple authorization: for now, only the user who added it can remove it.
    # You could expand this to allow the host to remove any song.
    if not song_to_remove or song_to_remove.get("added_by") != user_id:
        print(f"Unauthorized remove_song attempt by {user_id} for queue item {queue_id}")
        return

    before = len(queue)
    # Filter the queue, removing the item with the matching queue_id
    SESSIONS[session_code]["queue"] = [
        s for s in queue if s.get("queue_id") != queue_id
    ]
    after = len(SESSIONS[session_code]["queue"])
    print(f"User {user_id} removed song with queue_id {queue_id} from {session_code}: {before} → {after}")

    await sio.emit("queue_updated", SESSIONS[session_code]["queue"], room=session_code)