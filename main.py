import os
import sys
import traceback
from pathlib import Path

# Must run before importing `internal` (package __init__ loads .env/config).
if getattr(sys, "frozen", False):
    os.chdir(Path(sys.executable).resolve().parent)
else:
    os.chdir(Path(__file__).resolve().parent)

from dotenv import load_dotenv

load_dotenv(Path.cwd() / ".env")

import internal
from app import Application
from internal.utils.paths import is_frozen


if __name__ == "__main__":
    server_process = internal.start_server()
    # Never enable Vite/dev tools inside a packaged build.
    dev_mode = (not is_frozen()) and ("--dev" in sys.argv)

    app = None
    try:
        app = Application(dev_mode=dev_mode)
        app.run()
    except Exception:
        # console=False in the packaged build swallows uncaught exceptions;
        # write them out so they're diagnosable after install.
        from internal.utils.paths import data_dir
        crash_log = data_dir() / "crash.log"
        with crash_log.open("a", encoding="utf-8") as f:
            f.write(traceback.format_exc())
            f.write("\n")
        raise
    finally:
        if app is not None:
            app.shutdown(server_process)
