import os 

from dotenv import load_dotenv
from dataclasses import dataclass

load_dotenv()


@dataclass
class DatabaseConnection:
    url: str = os.getenv("DATABASE_URL")
    port: str = os.getenv("DB_PORT")
    user: str = os.getenv("DB_USER")
    host: str = os.getenv("DB_HOST")
    database: str = os.getenv("DB_NAME")
    connection: object = None