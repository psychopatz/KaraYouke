from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_search import YoutubeSearch
from typing import List, Dict, Optional  
from uuid import uuid4, UUID
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class User(BaseModel):
    user_id: str
    name: str
    profile_pic: str
    room_id: str
    type: str  # 'monitor' or 'remote'

class SongQueueItem(BaseModel):
    song_id: UUID
    title: str
    url: str
    thumbnail: str
    user: User
    
class SongAddtoQueue(BaseModel):
    title: str
    url: str
    thumbnail: str

class Room(BaseModel):
    room_id: str
    users: List[User] = []
    song_queue: List[SongQueueItem] = []

    class Config:
        arbitrary_types_allowed = True

rooms: Dict[str, Room] = {}
users: Dict[str, User] = {}

@app.get("/")
async def health_check():
    return {"message": "Karayouke API is up and running!"}



async def check_for_updates(room_id: str, last_version: Optional[int]):
    timeout = 30  # Timeout after 30 seconds
    start_time = asyncio.get_event_loop().time()
    while True:
        room = rooms.get(room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        current_version = len(room.song_queue)  # Using song queue length as a simple version indicator
        if last_version is None or current_version > last_version:
            return room

        # Check if timeout has been reached
        if asyncio.get_event_loop().time() - start_time > timeout:
            return room

        await asyncio.sleep(1)  # Wait before checking again

@app.get("/rooms/{room_id}")
async def get_room_details(room_id: str, last_version: Optional[int] = None):
    room = await check_for_updates(room_id, last_version)
    return {
        "room_id": room_id,
        "users": [user.dict() for user in room.users],
        "song_queue": [song.dict() for song in room.song_queue]
    }    
    

@app.post("/create_room/{room_id}")
async def create_room(room_id: str, name: str, profile_pic: str):
    if room_id in rooms:
        raise HTTPException(status_code=400, detail="Room already exists")
    monitor_id = str(uuid4())
    monitor_user = User(user_id=monitor_id, name=name, profile_pic=profile_pic, room_id=room_id, type="monitor")
    rooms[room_id] = Room(room_id=room_id, users=[monitor_user])
    users[monitor_id] = monitor_user
    return {"roomID": room_id,"sessionID": monitor_id,"type":monitor_user.type}

@app.get("/rooms")
async def get_rooms():
    room_list = [
        {
            "room_id": room_id,
            "users": [user.dict() for user in room.users],
            "song_queue": [song.dict() for song in room.song_queue]
        }
        for room_id, room in rooms.items()
    ]
    return {"rooms": room_list}


@app.post("/join_room/{room_id}")
async def join_room(room_id: str, name: str, profile_pic: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    user_id = str(uuid4())
    user = User(user_id=user_id, name=name, profile_pic=profile_pic, room_id=room_id, type="remote")
    rooms[room_id].users.append(user)
    users[user_id] = user
    return {"roomID": room_id,"sessionID": user_id,"type":user.type}

@app.post("/room/{room_id}/add_song")
async def add_song(room_id: str, song: SongAddtoQueue, user_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    if user_id not in users:
        raise HTTPException(status_code=404, detail="User not found")
    if users[user_id].room_id != room_id:
        raise HTTPException(status_code=403, detail="User not in the specified room")
    
    room = rooms[room_id]
    song_id = uuid4()
    song_queue_item = SongQueueItem(
        song_id=song_id,
        title=song.title,
        url=song.url,
        thumbnail=song.thumbnail,
        user=users[user_id]
    )
    room.song_queue.append(song_queue_item)
    
    return {"message": "Song added to queue", "song": song_queue_item.dict()}


@app.delete("/room/{room_id}/remove_song/{song_id}")
async def remove_song(room_id: str, song_id: UUID):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = rooms[room_id]
    song_to_remove = next((song for song in room.song_queue if song.song_id == song_id), None)
    if not song_to_remove:
        raise HTTPException(status_code=404, detail="Song not found in the queue")
    
    room.song_queue.remove(song_to_remove)
    return {"message": "Song removed from queue"}

@app.delete("/room/{room_id}")
async def delete_room(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = rooms[room_id]
    for user in room.users:
        del users[user.user_id]
    del rooms[room_id]
    
    return {"message": f"Room {room_id} deleted successfully"}


@app.get("/search")
async def search(query: str, max_results: int = Query(10, description="Maximum number of results to return"), page: int = Query(1, description="Page number")):
    results = YoutubeSearch(query, max_results=max_results).to_dict()
    start = (page - 1) * max_results
    end = start + max_results
    paginated_results = results[start:end]
    return {"results": paginated_results, "total_results": len(results), "page": page, "max_results": max_results}