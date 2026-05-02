from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/search")
def search():
    query = request.args.get("q")

    conn = sqlite3.connect("symbols.db")
    cur = conn.cursor()

    cur.execute("""
    SELECT * FROM symbols
    WHERE name LIKE ? OR readings LIKE ? OR meanings LIKE ?
    """, ('%' + query + '%', '%' + query + '%', '%' + query + '%'))

    rows = cur.fetchall()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "name": row[1],
            "readings": row[2],
            "meanings": row[3]
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)