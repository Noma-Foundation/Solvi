from internal.utils.system import OperatingSystem
from internal.utils.server import start_server, shutdown_server

from enum import IntEnum


class AuthenticationErrorCode(IntEnum):
    FATAL_ERROR = 1001


__all__ = [
    "OperatingSystem",
    "start_server",
    "shutdown_server",
    "AuthenticationErrorCode"
]
