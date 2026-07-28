import webview

import backend as backend

class Application:

    def __init__(self):
        self.api = backend.API()
        self.window = webview.create_window("Orderhub", "frontend/index.html", js_api=self.api)
    
    def run(self): 
        webview.start(debug=True)


if __name__ == "__main__":
    app = Application()
    app.run()
