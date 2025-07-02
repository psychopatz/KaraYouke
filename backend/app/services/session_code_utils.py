# backend/app/services/session_code_utils.py
import random
import string

def generate_session_code(length: int = 5) -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
