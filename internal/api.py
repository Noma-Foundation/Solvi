import json
from internal.database import DatabaseConnection, open_connection

class API:
    def __init__(self, db=None):
        if db is None:
            self.db = open_connection(DatabaseConnection())
        else:
            self.db = db

    def add_ticket(self, description, price):
        conn = self.db.connection
        cur = conn.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS tickets (id SERIAL PRIMARY KEY, description TEXT, price REAL);")
        cur.execute(
            "INSERT INTO tickets (description, price) VALUES (%s, %s) RETURNING id, description, price;",
            (description, float(price) if price is not None else None),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        if row:
            return json.dumps({"id": int(row[0]), "description": row[1], "price": float(row[2]) if row[2] is not None else 0.0})
        return json.dumps({})

    def get_tickets(self):
        conn = self.db.connection
        cur = conn.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS tickets (id SERIAL PRIMARY KEY, description TEXT, price REAL);")
        cur.execute("SELECT id, description, price FROM tickets ORDER BY id;")
        rows = cur.fetchall()
        tickets = []
        for r in rows:
            tickets.append({"id": int(r[0]), "description": r[1], "price": float(r[2]) if r[2] is not None else 0.0})
        cur.close()
        return json.dumps(tickets)
