@echo off
cd /d "%~dp0backend"
echo Activating virtual environment...
call .venv\Scripts\activate

echo Starting FastAPI Socket.IO server on http://localhost:8000 ...
uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload

pause
