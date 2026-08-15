import tomllib

from pathlib import Path

from internal.config import GlobalConfig

DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.toml"


class SettingAPI:

    def __init__(self):
        self.__global_vars = GlobalConfig()

    def ajust_settings(self, path: Path | str = DEFAULT_CONFIG_PATH) -> GlobalConfig | int:
        try:
            with open(path) as f:
                data = tomllib.load(f)
        except:
            return 1001

        global_data = data.get("global", {})

        self.__global_vars = GlobalConfig(**global_data)

        return self.__global_vars
