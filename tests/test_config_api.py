import pytest

from internal.setting_api import SettingAPI
from internal.config import GlobalConfig
from internal.utils import FileError


def test_open_setting_instance():
    api = SettingAPI()

    assert isinstance(api, SettingAPI)


def test_setting_file_with_incorrect_file():
    api = SettingAPI()

    with pytest.raises(FileError):    
        result = api.ajust_settings("exemple.toml")


def test_create_file_if_not_exist(mocker):
    pass
