# git-collaboration-input_root

入力（テキスト）
↓
JS（fetch）
↓
Flask /search
↓
DB検索
↓
JSON返す
↓
JSで表示


以下をはじめに実行する.
python init_db.py
python insert_data.py

DB追加したとき以下を実行.（データ重複の原因になる）
Ctrl + C
rm symbols.db
python init_db.py
python insert_data.py

今できたこと
・テキスト入力でDBにあるものを表示
・手書き入力はダミー実装
・データの重複改善

これからやること
・手書き入力をLaTeXに変換
・DBにない記号・文字をOpenAIが代わりに補足（動作確認が未実装）
・数学記号・文字でないものは警告
