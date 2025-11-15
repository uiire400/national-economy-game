# ⚡ クイックスタート

## 30秒でゲーム開始

### 1️⃣ インストール
```bash
npm install
```

### 2️⃣ サーバー起動
```bash
npm run dev:all
```

### 3️⃣ ブラウザで開く
```
http://localhost:3000
```

### 4️⃣ ゲーム開始
- 「✨ 新規ルーム作成」をクリック
- 複数タブで同じルームに参加
- 「ゲーム開始準備」をクリック
- ゲーム開始！

---

## 📖 詳細ガイド

- **セットアップ**: [README.md](README.md)
- **テスト手順**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **実装計画**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **プロジェクト状況**: [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 🎮 ゲーム操作

| アクション | ボタン | 説明 |
|-----------|--------|------|
| 準備完了 | ゲーム開始準備 | 全員準備で開始 |
| カード引き | 🎴 カードを引く | 手札に1枚追加 |
| コイン獲得 | 💰 コイン獲得 | +5コイン |
| カード建設 | 手札をクリック | コイン支払い |
| ターン終了 | 🔄 ターン終了 | 次プレイヤーへ |

---

## 🆘 トラブル時は

```bash
# WebSocket接続確認
npm run dev:ws

# ビルドテスト
npm run build

# 詳細ログ確認
npm run dev:ws 2>&1 | grep WebSocket
```

**[トラブルシューティング](README.md#-トラブルシューティング)** 参照

---

**楽しいゲームをお楽しみください！🎮✨**
