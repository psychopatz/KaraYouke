from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.youtube import router as youtube_router
import uvicorn

app = FastAPI()

# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(youtube_router, prefix="/api/youtube")

# Only run when executed directly, not during imports
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
