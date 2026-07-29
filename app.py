import webview

import backend as backend

class Application:

    def __init__(self, dev_mode: bool):
        self.api = backend.API()
        self.dev_mode = dev_mode
        if dev_mode:
            self.url = "http://localhost:5173"
        else:
            self.url = "frontend/index.html"
        self.window: any = webview.create_window(
            title="Orderhub",
            url=self.url,
            js_api=self.api,
            width=1080,
            height=780
        )
    
    def run(self): 
        webview.start(debug=self.dev_mode)
