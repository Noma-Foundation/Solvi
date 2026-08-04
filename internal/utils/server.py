import subprocess
import sys
import os
import subprocess
import time

from typing import Union

def start_server() -> Union[subprocess.Popen, bool]:
    if '--dev' in sys.argv:
        print("Initializing VITE...")
        
        frontend_dir = os.path.join(os.getcwd(), "frontend")
        print(f"Frontend directory: {frontend_dir}") 
        
        process = subprocess.Popen(
            "npm run dev", 
            cwd=frontend_dir, 
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE 
        )
        
        print("Waiting for VITE to compile and start...")
        time.sleep(3)
        print("VITE started! URL: http://localhost:5173")
        return process 
    return False


def shutdown_server(server_process: subprocess.Popen) -> None:
    if server_process:
        server_process.terminate()
        print("Shutdown from VITE server...")
    else:
        print("Server not running in development mode. Shutdown aborted.")
