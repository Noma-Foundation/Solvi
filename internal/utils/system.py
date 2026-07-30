from platform import platform
import platform

from dataclasses import dataclass

@dataclass
class OperatingSystem:
    name: str = platform.system()
    version: str = platform.version()
    architecture: str = platform.architecture()
    machine: str = platform.machine()
