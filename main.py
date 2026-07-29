import sys
import os
import subprocess
import time
from app import Application

def start_vite_if_dev():
    if '--dev' in sys.argv:
        print("Initializing VITE...")
        
        frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
        
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


if __name__ == "__main__":  
    dev_mode = start_vite_if_dev()
    
    app = Application(dev_mode=dev_mode)
    app.run()
