from dataclasses import dataclass

@dataclass
class DatabaseConnection:
    connection = None
    port: str = "5432"
    user: str = "postgres"
    host: str = "localhost"
    database: str = "postgres"
