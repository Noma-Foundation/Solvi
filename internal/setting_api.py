import tomllib

from pathlib import Path

from internal.config import GlobalConfig
from internal.utils import FileError

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.toml"


class SettingAPI:

    def __init__(self) -> None:
        self.__global_vars = GlobalConfig()

    def ajust_settings(self, path: Path | str = DEFAULT_CONFIG_PATH) -> GlobalConfig | FileError.OPEN_CONFIG_FILE_ERROR:
        try:
            with open(path, "rb") as f:
                data = tomllib.load(f)
        except FileNotFoundError:
            return FileError.OPEN_CONFIG_FILE_ERROR

        global_data = data.get("global", {})

        self.__global_vars = GlobalConfig(**global_data)

        return self.__global_vars

    def __create_setting_file_if_not_exist(self) -> None:
        pass
