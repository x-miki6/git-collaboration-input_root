from flask import Flask, render_template, request, jsonify
import sqlite3
import requests

from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

app = Flask(__name__) 


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
    
    if len(results) == 0:    # DBになかった場合

        ai_result = {
            "name": query,
            "meanings": ask_ai(query)
        }

        return jsonify([ai_result])
    
    return jsonify(results)   # DBにあった場合

def ask_ai(symbol):    # AI代打回答関数

    response = client.chat.completions.create(
        model="gpt-4.1-mini",

        messages=[
            {
                "role": "system",
                "content": "あなたは数学記号を解説する先生です。"
            },
            {
                "role": "user",
                "content": f"{symbol} の数学記号または文字の読みと意味（意味が複数ある場合は場合分けして）を簡潔に説明してください。数学記号・文字でないものであった場合、「数学記号または文字と判定できませんでした」と表示してください。"
            }
        ]
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    app.run(debug=True)

