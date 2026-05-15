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

今できたこと
・テキスト入力でDBにあるものを表示
・手書き入力はダミー実装

これからやること
・手書き入力をLaTeXに変換
・DBにない記号・文字をAIが代わりに補足（動作確認が未実装）
・数学記号・文字でないものは警告