import platform

from dataclasses import dataclass

@dataclass
class OperatingSystem:
    name: str = platform.system()
    version: str = platform.version()
    architecture: str = platform.architecture()[0]
    machine: str = platform.machine()
    

    def get_device_info(self):
        return {
            "name": self.name,
            "version": self.version,
            "architecture": self.architecture,
            "machine": self.machine
        }
