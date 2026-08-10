from enum import IntEnum


class DatabaseError(IntEnum):
    FATAL_ERROR = 2001
    QUERY_ERROR = 2002
    CONNECTION_ERROR = 2003
    CURSOR_ERROR = 2004
