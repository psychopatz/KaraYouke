from fastapi import FastAPI, Query
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