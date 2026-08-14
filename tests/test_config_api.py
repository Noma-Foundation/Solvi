import pytest

from internal.setting_api import SettingAPI


@pytest.fixture
def toml_file(tmp_path):
    content = """
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
    path = tmp_path / "config.toml"
    path.write_text(content, encoding="utf-8")
    return path


def test_open_setting_instance():
    api = SettingAPI()
    assert isinstance(api, SettingAPI)   


def test_ajust_settings_loads_all_fields(toml_file):
    api = SettingAPI()
    config = api.ajust_settings(path=toml_file)

    assert config.name == "Solvi"
    assert config.version == "3.1.4"
    assert config.company_name == "FixIT"
    assert config.timezone == "America/Sao_Paulo"
    assert config.environment == "development"
    assert config.debug is True
    assert config.base_url == "http://localhost:5173"
    assert config.maintaince_mode is True


def test_ajust_settings_missing_file(tmp_path):
    api = SettingAPI()
    with pytest.raises(FileNotFoundError):
        api.ajust_settings(path=tmp_path / "nao_existe.toml")


def test_ajust_settings_missing_optional_key(tmp_path):
    path = tmp_path / "config.toml"
    path.write_text('[global]\nname = "Solvi"\n', encoding="utf-8")

    api = SettingAPI()
    config = api.ajust_settings(path=path)

    assert config.name == "Solvi"
    assert config.version is None
