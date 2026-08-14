import sys
import tomllib

sys.path.append(".")

from internal.setting_api import SettingAPI
from internal.config import GlobalConfig


def test_open_setting_instance():
    api = SettingAPI()

    assert isinstance(api.global_vars, GlobalConfig)


def test_ajust_settings_loads_all_fields(): 
    pass


def test_ajust_settings_missing_file():
    pass


def test_ajust_settings_missing_optional_key():
    pass 
