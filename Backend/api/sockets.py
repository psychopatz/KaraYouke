from fastapi_socketio import SocketManager
from fastapi import FastAPI

# Create a new FastAPI instance
app = FastAPI()

# Create a new SocketManager instance and pass the app
sio = SocketManager(app=app, cors_allowed_origins=["*"])  # Set your allowed origins here

# Socket.IO event handler for connection
@sio.on('connect')
async def connect(sid, environ):
    print("Client connected:", sid)
    await sio.emit('message', {'data': 'Connected'}, to=sid)

# Socket.IO event handler for disconnection
@sio.on('disconnect')
async def disconnect(sid):
    print("Client disconnected:", sid)

# Custom Socket.IO event handler
@sio.on('my_event')
async def my_event(sid, data):
    print("Message from client:", data)
    await sio.emit('message', {'data': 'Received your message!'}, to=sid)
