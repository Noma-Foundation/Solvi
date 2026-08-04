import internal 

from app import Application


if __name__ == "__main__":  
    server_process = internal.start_server()
    
    app = Application(dev_mode=True)
    app.run()
    app.shutdown(server_process)
