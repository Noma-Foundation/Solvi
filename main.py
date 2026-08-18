import sys
import internal 

from app import Application


if __name__ == "__main__":  
    server_process = internal.start_server()
    dev_mode = True if '--dev' in sys.argv else False
    
    app = Application(dev_mode=dev_mode)
    app.initialize()
    app.run()
    app.shutdown(server_process)
