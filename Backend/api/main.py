from fastapi import FastAPI
from youtube_search import YoutubeSearch

app = FastAPI()

@app.get("/")
async def health_check():
    return {"message": "Karayouke API is up and running!"}


@app.get("/search")
async def search(query: str):
    results = YoutubeSearch(query, max_results=10).to_dict()
    return {"results": results}

