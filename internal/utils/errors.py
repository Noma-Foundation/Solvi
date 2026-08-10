from enum import IntEnum


class AuthenticationCodeError(IntEnum):
    FATAL_ERROR = 1001
    CONNECTION_ERROR = 1002


class DatabaseError(IntEnum):
    FATAL_ERROR = 2001
    CONNECTION_ERROR = 2002
