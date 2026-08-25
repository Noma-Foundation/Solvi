import pytest

from internal.setting_api import SettingAPI
from internal.config import GlobalConfig
from internal.utils import FileError

VALID_GLOBAL_TOML_FILE = """
[global]
name = "Solvi"
version = "3.1.4"
company_name = "FixIT"
timezone = "America/Sao Paulo"
environment = "development" # development, staging, "production"
debug = true 
base_url = "http://localhost:5173"
maintaince_mode = true
"""


def test_open_setting_instance():
    api = SettingAPI()

    assert isinstance(api, SettingAPI)


def test_setting_file_with_incorrect_file(tmp_path):
    config = tmp_path / "exemple.toml"
    api = SettingAPI()

    with pytest.raises(FileError):    
        result = api.ajust_settings(config)


def test_global_content(tmp_path):
    config = tmp_path / "config.toml"
    config.write_text(VALID_GLOBAL_TOML_FILE)

    api = SettingAPI() 

    result = api.ajust_settings(config)

    assert result['name'] == "Solvi"
    assert result['company_name'] == "FixIT"
    assert result['debug'] == True
