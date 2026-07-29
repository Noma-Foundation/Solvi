import sys

sys.path.append(".")

from internal import OperatingSystem

def test_device(): 
    osystem = OperatingSystem()

    assert osystem.is_windows()
    assert not osystem.is_linux()
    assert not osystem.is_macos()
