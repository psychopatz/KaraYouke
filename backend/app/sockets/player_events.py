# File: backend/app/sockets/player_events.py
from app.sockets.socket_server import sio
from app.state import SESSIONS

@sio.event
async def remote_wants_to_start(sid, data):
    """
    A remote user has requested to start the karaoke session.
    We forward this request to the designated host of the session.
    """
    session_code = data.get('session_code')
    if not session_code or session_code not in SESSIONS:
        print(f"[remote_wants_to_start] Invalid request from {sid} for session {session_code}")
        return

    host_sid = SESSIONS[session_code].get('host_sid')
    if host_sid:
        # Prevent spamming the host if the session is already live
        if not SESSIONS[session_code].get("is_started", False):
            print(f"Relaying 'start session' request from remote {sid} to host {host_sid} for session {session_code}")
            # Command the host client to start the session.
            await sio.emit('start_session_from_remote', to=host_sid)
        else:
            print(f"Ignoring 'start session' request from {sid}, session '{session_code}' already started.")


@sio.event
async def host_started_session(sid, data):
    """
    The host has started the karaoke session.
    Update the session state on the server and broadcast the change to all clients.
    """
    session_code = data.get('session_code')
    if not session_code or session_code not in SESSIONS:
        print(f"[host_started_session] Invalid broadcast from {sid} for session {session_code}")
        return

    # 1. Update the state on the server to be the single source of truth.
    SESSIONS[session_code]['is_started'] = True
    print(f"Host {sid} has started session {session_code}. State updated to is_started: True.")

    # 2. Broadcast the ENTIRE updated session data to ALL clients in the room.
    # This is the key to keeping all current and future remotes in sync.
    await sio.emit('session_updated', SESSIONS[session_code], room=session_code)


# This handler receives a control command from a remote client.
@sio.event
async def player_control(sid, data):
    """
    Receives a player control action from a remote and forwards it to the host.
    :param data: {
        'session_code': str,
        'action': 'toggle_play_pause' | 'next_song',
        'user': {'id': str, 'name': str}
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
        await sio.emit('player_control', data, to=host_sid)
    else:
        print(f"[player_control] Host not found for session {session_code}")


# This handler is triggered when a remote needs the current player state.
@sio.event
async def get_player_state(sid, session_code):
    """
    A remote is asking for the current player state. We ask the host to provide it.
    """
    if not session_code or session_code not in SESSIONS:
        return

    host_sid = SESSIONS[session_code].get('host_sid')
    if host_sid:
        print(f"Asking host {host_sid} for player state for session {session_code}")
        # Ask the host to report its current state.
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
    
    # Broadcast to everyone in that room, skipping the sender.
    print(f"Broadcasting player state {data.get('isPlaying')} to session {session_code}")
    await sio.emit('player_state_updated', data, room=session_code, skip_sid=sid)