import sys

sys.path.append(".")

from internal import OperatingSystem

def test_device(): 
    osystem = OperatingSystem()

    assert osystem.name.lower() in ["windows", "linux", "macos"]
    assert osystem.architecture[0] in ["64bit", "32bit", "arm64"]
