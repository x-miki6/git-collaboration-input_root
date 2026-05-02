import sqlite3

conn = sqlite3.connect("symbols.db")
cur = conn.cursor()

cur.execute("SELECT * FROM symbols")
rows = cur.fetchall()

for row in rows:
    print(row)

conn.close()