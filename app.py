from flask import Flask, render_template, request, jsonify
import sqlite3
import requests

app = Flask(__name__)  # 🔥 これ追加


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/recognize", methods=["POST"])   # 手書き入力認識（未完成）
def recognize():
    print("jsが呼ばれました")

    image = request.json["image"]
    print("受け取った画像:", image[:30])

    symbols = ["Σ"]

    response = requests.post(
        "https://api.mathpix.com/v3/text",    # mathpixの代替案を見つける
        headers={
            "app_id": "YOUR_ID",
            "app_key": "YOUR_KEY",
            "Content-type": "application/json"
        },
        json={
            "src": image
        }
    )

    data = response.json()

    print("Mathpix response:", data)

    latex = data.get("latex", "")

    # LaTeX → 記号変換
    latex_to_symbol = {
        "\\Sigma": "Σ",
        "\\sigma": "σ",
        "\\pi": "π",
        "\\alpha": "α",
        "\\beta": "β"
    }

    symbols = []

    for key in latex_to_symbol:
        if key in latex:
            symbols.append(latex_to_symbol[key])

    return jsonify({
        "symbols": symbols
    })


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
    
    if len(results) == 0:    # AIの代打回答ダミー
        ai_result = {
            "name": query,
            "meanings": f"{query} はDBにない特殊な数学記号の可能性があります。"
        }
        return jsonify([ai_result])

    return jsonify(results)



if __name__ == "__main__":
    app.run(debug=True)

