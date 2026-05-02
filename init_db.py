import sqlite3

conn = sqlite3.connect("symbols.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE symbols (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  readings TEXT,
  meanings TEXT
)
""")

conn.commit()
conn.close()

print("DB作成完了")