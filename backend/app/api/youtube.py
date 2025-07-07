# backend/app/api/youtube.py

from fastapi import APIRouter, Query
import httpx
import asyncio
import logging
import time
from youtube_search import YoutubeSearch

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

EMBEDDABILITY_CACHE = {}
CACHE_TTL_SECONDS = 86400

async def is_embeddable(video_id: str) -> bool:
    current_time = time.time()
    if video_id in EMBEDDABILITY_CACHE:
        is_embeddable_flag, cached_time = EMBEDDABILITY_CACHE[video_id]
        if (current_time - cached_time) < CACHE_TTL_SECONDS:
            return is_embeddable_flag
    oembed_url = "https://www.youtube.com/oembed"
    params = {"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(oembed_url, params=params, timeout=5.0)
            is_ok = response.status_code == 200
            EMBEDDABILITY_CACHE[video_id] = (is_ok, current_time)
            return is_ok
        except httpx.RequestError:
            EMBEDDABILITY_CACHE[video_id] = (False, current_time)
            return False

# --- THIS IS THE FIX ---
# The endpoint now accepts a 'page' parameter to support pagination.
@router.get(
    "/search",
    tags=["YouTube"],
    summary="Search YouTube with Robust Pagination",
    description="Supports true pagination by fetching a large set and serving pages from it.",
)
async def search_youtube(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(10, ge=5, le=20, description="Items per page"),
    page: int = Query(1, ge=1, description="Page number to retrieve")
):
    try:
        enhanced_query = f"{q}"
        
        # To support pagination, we need to fetch more results upfront.
        # youtube-search doesn't have a 'page' param, so we simulate it.
        # Fetching 50 gives us a good pool to serve several pages from.
        results_raw = YoutubeSearch(enhanced_query, max_results=50).to_dict()

        if not results_raw:
            return {"status": "OK", "query": q, "results": [], "has_more": False}

        tasks = [is_embeddable(video.get("id")) for video in results_raw if video.get("id")]
        embeddability_results = await asyncio.gather(*tasks)

        all_embeddable_videos = [
            video for video, is_embeddable_flag in zip(results_raw, embeddability_results) if is_embeddable_flag
        ]

        # Calculate the slice for the requested page.
        start_index = (page - 1) * limit
        end_index = start_index + limit
        paginated_results = all_embeddable_videos[start_index:end_index]

        # Determine if there are more pages available after this one.
        has_more = end_index < len(all_embeddable_videos)

        return {
            "status": "OK",
            "query": q,
            "results": paginated_results,
            "has_more": has_more  # Explicitly tell the frontend if there are more.
        }

    except Exception as e:
        logger.error(f"An unexpected error occurred during YouTube search for query '{q}': {e}")
        return {"status": "error", "message": "An error occurred while searching. Please try again."}