import subprocess
import sys
import os
import subprocess
import time


def start_server():
    if '--dev' in sys.argv:
        print("Initializing VITE...")
        
        frontend_dir = os.path.join(os.getcwd(), "frontend")
        print(f"Frontend directory: {frontend_dir}") 
        
        subprocess.Popen(
            "npm run dev", 
            cwd=frontend_dir, 
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE 
        )
        
        print("Waiting for VITE to compile and start...")
        time.sleep(3)
        print("VITE started! URL: http://localhost:5173")
        return True
    return False


def shutdown_server(dev_mode):
    if dev_mode:
        id_process = subprocess.Popen(
            "npm run dev",
            cwd=os.path.join(os.getcwd(), "frontend"),
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        id_process.terminate()
        print("Shutdown from VITE server...")
    else:
        print("Server not running in development mode. Shutdown aborted.")
