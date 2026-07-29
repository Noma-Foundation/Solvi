import webview

import backend as backend

class Application:

    def __init__(self, dev_mode: bool):
        self.api = backend.API()
        if dev_mode:
            self.url = "http://localhost:5173"
        else:
            self.url = "frontend/index.html"
        self.window: any = webview.create_window("Orderhub", self.url, js_api=self.api)
    
    def run(self): 
        webview.start(debug=True)
