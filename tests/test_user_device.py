import sys

sys.path.append(".")

from internal import OperatingSystem

def test_device(mocker): 
    fake_os = mocker.patch('internal.utils.system.platform.system', return_value='Windows')
    mock_instance = OperatingSystem()
    device_info = mock_instance.get_device_info()

    assert device_info['name'] in fake_os()

    