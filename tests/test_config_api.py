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
