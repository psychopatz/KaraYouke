# File: backend/app/api/network.py
import socket
from fastapi import APIRouter

router = APIRouter()

@router.get("/host_ip", tags=["Debug"])
def get_host_ip():
    hostname = socket.gethostname()
    ip = socket.gethostbyname(hostname)
    return {"host_ip": ip}
