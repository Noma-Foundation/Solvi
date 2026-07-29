import internal 

from app import Application


if __name__ == "__main__":  
    dev_mode = internal.start_server()
    
    app = Application(dev_mode=dev_mode)
    app.run()
    app.on_shutdown()
