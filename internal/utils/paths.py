import sys
from pathlib import Path


def is_frozen() -> bool:
    return getattr(sys, "frozen", False)


def app_dir() -> Path:
    """Directory of the executable (frozen) or project root (dev)."""
    if is_frozen():
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parents[2]


def resource_dir() -> Path:
    """Bundled read-only resources (PyInstaller _MEIPASS or project root)."""
    if is_frozen():
        return Path(getattr(sys, "_MEIPASS"))
    return app_dir()


def resource_path(*parts: str) -> Path:
    return resource_dir().joinpath(*parts)


def data_dir() -> Path:
    """Writable data next to the executable / project root."""
    path = app_dir() / "data"
    path.mkdir(parents=True, exist_ok=True)
    return path
