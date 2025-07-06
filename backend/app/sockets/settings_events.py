# File: backend/app/sockets/settings_events.py
from app.sockets.socket_server import sio
from app.state import SESSIONS

@sio.event
async def change_setting(sid, data):
    """
    Receives a request to change a session-wide setting.
    Updates the setting in the server state and broadcasts the change to all clients.
    :param data: {'session_code': str, 'key': str, 'value': any}
    """
    session_code = data.get("session_code")
    key = data.get("key")
    value = data.get("value")

    if not all([session_code, key, session_code in SESSIONS]):
        print(f"[change_setting] Invalid request from {sid}")
        return

    # Update the setting directly in the session's state
    if "settings" not in SESSIONS[session_code]:
         SESSIONS[session_code]["settings"] = {} # Defensive coding
    SESSIONS[session_code]["settings"][key] = value
    
    print(f"Session '{session_code}' setting '{key}' changed to '{value}'. Broadcasting.")

    # Broadcast the specific setting change to all clients in the room
    await sio.emit("setting_updated", {"key": key, "value": value}, room=session_code)