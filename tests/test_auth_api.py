import sys

sys.path.append(".")

import bcrypt

from internal.api import API
from internal.utils import AuthenticationCodeError


class FakeCursor:
    def __init__(self, row):
        self._row = row

    def execute(self, query, params):
        pass

    def fetchone(self):
        return self._row

    def close(self):
        pass


class FakeConn:
    def __init__(self, row):
        self._cursor = FakeCursor(row)

    def cursor(self):
        return self._cursor


def test_auth_user_no_db(monkeypatch):
    api = API.__new__(API)
    api.db = None

    monkeypatch.setattr(API, "_window", None)

    assert api.auth_user("any", "any") is AuthenticationCodeError.FATAL_ERROR


def test_auth_user_user_not_found():
    api = API.__new__(API)
    api.db = type("D", (), {})()
    fake_conn = FakeConn(None)
    api.db.connection = fake_conn
    assert api.auth_user("no_user", "pass") is False


def test_auth_user_success(monkeypatch):
    api = API.__new__(API)
    api.db = type("D", (), {})()
    fake_row = ("bob", "$2b$12$hashplaceholder")
    api.db.connection = FakeConn(fake_row)
    monkeypatch.setattr(bcrypt, "checkpw", lambda p, h: True)
    assert api.auth_user("bob", "secret") is True


def test_auth_user_wrong_password(monkeypatch):
    api = API.__new__(API)
    api.db = type("D", (), {})()
    fake_row = ("bob", "$2b$12$hashplaceholder")
    api.db.connection = FakeConn(fake_row)
    monkeypatch.setattr(bcrypt, "checkpw", lambda p, h: False)
    assert api.auth_user("bob", "wrong") is False
