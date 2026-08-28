import os

from typing import Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class DBConfig:
    host: str | None = os.getenv("DB_HOST")
    user: str | None = os.getenv("DB_USER")
    password: str | None = os.getenv("DB_PASSWORD")
    database: str | None = os.getenv("DB_NAME")
    port: str | None = os.getenv("DB_PORT")
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
    maintaince_mode: Optional[str | bool] = None
