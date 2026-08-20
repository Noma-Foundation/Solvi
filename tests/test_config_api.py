from internal.setting_api import SettingAPI
from internal.config import GlobalConfig
from internal.utils import FileError


VALID_TOML_CONTENT = """
[global]
name = "Solvi"
version = "3.1.4"
company_name = "FixIT"
timezone = "America/Sao_Paulo"
environment = "development"
debug = true
base_url = "http://localhost:5173"
maintaince_mode = true
"""


def test_open_setting_instance():
    api = SettingAPI()

    assert isinstance(api, SettingAPI)


def test_ajust_settings_returns_global_config_instance(tmp_path):
    config_file = tmp_path / "config.toml"
    config_file.write_text(VALID_TOML_CONTENT, encoding="utf-8")

    api = SettingAPI()
    result = api.ajust_settings(str(config_file))

    assert isinstance(result, GlobalConfig)


def test_ajust_settings_with_valid_toml_file(tmp_path):
    config_file = tmp_path / "config.toml"
    config_file.write_text(VALID_TOML_CONTENT, encoding="utf-8")

    api = SettingAPI()
    result = api.ajust_settings(str(config_file))

    assert result.name == "Solvi"
    assert result.version == "3.1.4"
    assert result.company_name == "FixIT"
    assert result.timezone == "America/Sao_Paulo"
    assert result.environment == "development"
    assert result.debug is True
    assert result.base_url == "http://localhost:5173"
    assert result.maintaince_mode is True


def test_ajust_settings_accepts_path_object(tmp_path):
    config_file = tmp_path / "config.toml"
    config_file.write_text(VALID_TOML_CONTENT, encoding="utf-8")

    api = SettingAPI()
    result = api.ajust_settings(config_file)

    assert isinstance(result, GlobalConfig)
    assert result.name == "Solvi"


def test_ajust_settings_with_missing_global_section_returns_defaults(tmp_path):
    config_file = tmp_path / "config.toml"
    config_file.write_text('[database]\nname = "orderhub"\n', encoding="utf-8")

    api = SettingAPI()
    result = api.ajust_settings(str(config_file))

    assert isinstance(result, GlobalConfig)
    assert result.name is None
