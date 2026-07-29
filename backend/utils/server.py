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