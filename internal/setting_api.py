import tomllib

from typing import Any
from dataclasses import asdict

from internal.config import GlobalConfig
from internal.utils import FileError


class SettingAPI:

    def __init__(self) -> None:
        self.__global_vars = GlobalConfig()

    def ajust_settings(self, path: str = "config.toml") -> dict[str, Any] | FileError:        
        try:
            with open(path, "rb") as f:
                data = tomllib.load(f)
        except FileNotFoundError:
            raise FileError("Error opening configuration file. Configuration file does not exist.")

        global_data = data.get("global", {})

        self.__global_vars = GlobalConfig(**global_data)

        return asdict(self.__global_vars)
