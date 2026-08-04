import internal 

from app import Application


if __name__ == "__main__":  
    server_process = internal.start_server()
    dev_mode = True
    
    app = Application(dev_mode=dev_mode)
    app.run()
    app.shutdown(server_process)
