from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from youtube_search import YoutubeSearch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# A dictionary to keep track of connected clients
clients = {}

@app.get("/")
async def health_check():
    return {"message": "Karayouke API is up and running!"}


@app.get("/search")
async def search(query: str, max_results: int = Query(10, description="Maximum number of results to return"), page: int = Query(1, description="Page number")):
    results = YoutubeSearch(query, max_results=max_results).to_dict()
    start = (page - 1) * max_results
    end = start + max_results
    paginated_results = results[start:end]
    return {"results": paginated_results, "total_results": len(results), "page": page, "max_results": max_results}

@app.websocket("/ws/remote")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = id(websocket)
    clients[client_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            for client in clients.values():
                if client != websocket:
                    await client.send_text(data)
    except:
        del clients[client_id]