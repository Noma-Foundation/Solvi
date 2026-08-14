import sys

sys.path.append(".")

from internal.setting_api import SettingAPI


def test_open_setting():
    api = SettingAPI()

    assert api.message() == "Hello, World!"