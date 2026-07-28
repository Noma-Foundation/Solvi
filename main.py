import webview

class Application:

    def __init__(self):
        self.window = webview.create_window("Orderhub", "frontend/index.html")
    
    def run(self): 
        webview.start(debug=True)


if __name__ == "__main__":
    app = Application()
    app.run()
