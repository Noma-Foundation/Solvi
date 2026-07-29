import platform

class OperatingSystem:
    def __init__(self):
        self.system = platform.system()

    def is_windows(self):
        return self.system == "Windows"

    def is_linux(self):
        return self.system == "Linux"

    def is_macos(self):
        return self.system == "Darwin"