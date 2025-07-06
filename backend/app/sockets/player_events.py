# File: backend/app/sockets/player_events.py
from app.sockets.socket_server import sio
from app.state import SESSIONS

# This handler receives a control command from a remote client.
@sio.event
async def player_control(sid, data):
    """
    Receives a player control action from a remote and forwards it to the host.
    Future-proofed to include user info for toast messages on the host screen.
    :param data: {
        'session_code': str,
        'action': 'toggle_play_pause' | 'next_song',
        'user': {'id': str, 'name': str} # <-- User info for toast messages
    }
    """
    session_code = data.get('session_code')
    user = data.get('user')
    
    if not all([session_code, user, session_code in SESSIONS]):
        print(f"[player_control] Invalid request data from {sid}")
        return

    # Find the host's unique session ID (sid)
    host_sid = SESSIONS[session_code].get('host_sid')

    if host_sid:
        print(f"Forwarding action '{data.get('action')}' from {user.get('name')} to host {host_sid}")
        # Emit the event *only* to the host client.
        # The host's KaraokePage.jsx is listening for this exact event.
        # We forward the entire data object, including user details.
        await sio.emit('player_control', data, to=host_sid)
    else:
        print(f"[player_control] Host not found for session {session_code}")


# This handler is triggered when a remote needs the current player state.
@sio.event
async def get_player_state(sid, session_code):
    """
    A remote is asking for the current player state. We ask the host to provide it.
    :param session_code: The session code string.
    """
    if not session_code or session_code not in SESSIONS:
        return

    host_sid = SESSIONS[session_code].get('host_sid')
    if host_sid:
        print(f"Asking host {host_sid} for player state for session {session_code}")
        # Ask the host to report its current state.
        # The host's KaraokePage.jsx will respond with a 'player_state_updated' event.
        await sio.emit('get_player_state', to=host_sid)


# This handler receives the state update FROM the host and broadcasts it to all remotes.
@sio.event
async def player_state_updated(sid, data):
    """
    The host has updated its player state. Broadcast this to all remotes in the room.
    :param data: {'session_code': str, 'isPlaying': bool}
    """
    session_code = data.get('session_code')
    if not session_code or session_code not in SESSIONS:
        return
    
    # The 'room' is the session_code. We broadcast to everyone in that room.
    # We use 'skip_sid=sid' to avoid sending the message back to the host who sent it.
    print(f"Broadcasting player state {data.get('isPlaying')} to session {session_code}")
    await sio.emit('player_state_updated', data, room=session_code, skip_sid=sid)