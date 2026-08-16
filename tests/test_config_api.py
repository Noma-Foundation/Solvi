import pytest

from internal.setting_api import SettingAPI
from internal.utils import FileError


def test_open_setting_instance():
    api = SettingAPI()

    assert isinstance(api, SettingAPI)


def test_ajust_settings_returns_global_config_instance():
    pass


def test_ajust_settings_with_valid_toml_file(): 
    pass 


def test_ajust_settings_accepts_path_object():
    pass 


def test_open_settings_with_file_open_error(mocker):
    mocker.patch("internal.setting_api.open", side_effect=FileNotFoundError)

    api = SettingAPI()
    result = api.ajust_settings("nonexistent_config.toml")

    assert result == FileError.OPEN_CONFIG_FILE_ERROR
