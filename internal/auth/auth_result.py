from typing import Optional
from dataclasses import dataclass


@dataclass
class AuthResult:
    success: bool
    reason: Optional[str] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
