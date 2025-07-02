# File: backend/app/api/youtube.py
from fastapi import APIRouter, Query
from youtube_search import YoutubeSearch
import json

router = APIRouter()

@router.get("/search")
def search_youtube(
    q: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=20, description="Max results to return")
):
    try:
        results_raw = YoutubeSearch(q, max_results=limit).to_json()
        parsed = json.loads(results_raw)["videos"]

        return {
            "status": "OK",
            "query": q,
            "limit": limit,
            "results": parsed
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
