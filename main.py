import webview

window = webview.create_window("Orderhub", "frontend/index.html")
webview.start(debug=True)