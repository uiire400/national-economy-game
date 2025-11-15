#!/bin/bash

# ナショナルエコノミー メシア - セットアップスクリプト
# このスクリプトを実行して、開発環境を自動セットアップできます

set -e

echo "=========================================="
echo "ナショナルエコノミー メシア"
echo "開発環境セットアップ"
echo "=========================================="
echo ""

# Step 1: Node.js 確認
echo "[1/5] Node.js と npm のバージョン確認..."
node --version
npm --version
echo ""

# Step 2: パッケージのインストール
echo "[2/5] パッケージをインストール中..."
npm install
echo ""

# Step 3: ビルドテスト
echo "[3/5] Next.js ビルドテスト..."
npm run build
echo ""

# Step 4: 完了
echo "[4/5] セットアップ完了！"
echo ""

# Step 5: 次のステップを表示
echo "[5/5] 開発サーバーを起動してください:"
echo ""
echo "  推奨（WebSocket サーバー + Next.js UI）:"
echo "  $ npm run dev:all"
echo ""
echo "  または、別々のターミナルで起動："
echo "  ターミナル 1: $ npm run dev      # Next.js UI"
echo "  ターミナル 2: $ npm run dev:ws   # WebSocket サーバー"
echo ""
echo "=========================================="
