import os
import datetime

# ==========================================
# 設定項目
# ==========================================
# サイトのドメイン
BASE_URL = 'https://reone-boardgame.github.io'

# スキャン対象のルートディレクトリ
ROOT_DIR = '.'

# 出力するファイル名
OUTPUT_FILE = 'sitemap.xml'

# サイトマップに含めないファイル名
EXCLUDE_FILES = {
    'header.html',
    'footer.html',
    'news_template.html',
    'under-construction.html',
    '404.html',
    '.DS_Store',
}

# サイトマップに含めないディレクトリ名
EXCLUDE_DIRS = {
    '.git',
    '.github',
    '.vscode',
    '__pycache__'
}

# ==========================================
# 処理ロジック
# ==========================================

def generate_sitemap():
    urls = []
    
    print(f"スキャン開始: {os.path.abspath(ROOT_DIR)}")

    # ディレクトリを再帰的に走査
    for root, dirs, files in os.walk(ROOT_DIR):
        # 除外ディレクトリを探索対象から削除
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            # HTMLファイルのみを対象とする
            if not file.endswith('.html'):
                continue
                
            # 除外ファイルリストにある場合はスキップ
            if file in EXCLUDE_FILES:
                continue
            
            # ファイルのパスを生成
            file_path = os.path.join(root, file)
            
            # ドメイン直下からの相対パスを取得
            rel_path = os.path.relpath(file_path, ROOT_DIR).replace(os.sep, '/')
            
            # URLの正規化処理
            if rel_path == 'index.html':
                # トップページ
                final_url = BASE_URL + '/'
            elif rel_path.endswith('/index.html'):
                # ディレクトリのインデックス
                final_url = BASE_URL + '/' + rel_path[:-10] 
            else:
                # 通常のページ
                final_url = BASE_URL + '/' + rel_path
            
            # ファイルの最終更新日時を取得
            try:
                mtime = os.path.getmtime(file_path)
                lastmod = datetime.date.fromtimestamp(mtime).isoformat()
            except Exception:
                lastmod = datetime.date.today().isoformat()
                
            urls.append((final_url, lastmod))

    # URLをアルファベット順にソート
    urls.sort(key=lambda x: x[0])

    # XMLの組み立て
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url, lastmod in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url}</loc>\n'
        xml_content += f'    <lastmod>{lastmod}</lastmod>\n'
        xml_content += '  </url>\n'
    
    xml_content += '</urlset>'
    
    # ファイル書き込み
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print("-" * 30)
    print(f"生成完了: {len(urls)} ページ")
    print(f"出力ファイル: {os.path.abspath(OUTPUT_FILE)}")
    print("-" * 30)
    # 確認用に出力されたURLの一部を表示
    for u in urls[:5]:
        print(f"対象: {u[0]}")
    if len(urls) > 5:
        print("...")

if __name__ == '__main__':
    generate_sitemap()
