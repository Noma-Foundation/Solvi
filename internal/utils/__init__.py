from internal.utils.system import OperatingSystem
from internal.utils.server import start_server, shutdown_server

from enum import IntEnum


class AuthenticationCodeError(IntEnum):
    FATAL_ERROR = 1001
    CONNECTION_ERROR = 1002


__all__ = [
    "OperatingSystem",
    "start_server",
    "shutdown_server",
    "AuthenticationCodeError"
]
