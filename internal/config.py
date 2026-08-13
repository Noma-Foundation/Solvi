import os
import tomllib

from typing import Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class DBConfig:
    host: str = os.getenv("DB_HOST")
    user: str = os.getenv("DB_USER")
    password: str = os.getenv("DB_PASSWORD")
    database: str = os.getenv("DB_NAME")
    port: str = os.getenv("DB_PORT")
    url: Optional[str] = os.getenv("DATABASE_URL")


@dataclass
class GlobalConfig: 
    name: Optional[str] = None
    version: Optional[str] = None
    company_name: Optional[str] = None
    timezone: Optional[str] = None
    environment: Optional[str] = None
    debug: Optional[str | bool] = None
    base_url: Optional[str] = None
    maintainance_mode: Optional[str | bool] = None
