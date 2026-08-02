from typing import Optional
import os

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
    name: Optional[None] = None
    version: Optional[None] = None
    company_name: Optional[None] = None
    timezone: Optional[None] = None
    environment: Optional[None] = None
    debug: Optional[None] = None
    base_url: Optional[None] = None
    maintainance_mode: Optional[None] = None
