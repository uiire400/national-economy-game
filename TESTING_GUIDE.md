# Phase 3 実装完了ガイド

## ✅ 実装完了内容

### ステップ 1: GameState にアクションメソッド追加 ✅

ファイル: `src/lib/game/GameState.ts`

以下のメソッドを追加しました：

- `drawCard(playerId)`: プレイヤーがカードを引く
- `gainCoins(playerId, amount)`: プレイヤーがコイン獲得
- `buildBuilding(playerId, cardId)`: プレイヤーが建物を建設

### ステップ 2: server.ts の handleAction 拡張 ✅

ファイル: `server.ts`

以下のアクションハンドラーを実装：

- `draw_card`: カード引きアクション
- `gain_coins`: コイン獲得アクション
- `build_card`: 建物建設アクション
- `next_turn`: ターン進行アクション

### ステップ 3: React クライアントコンポーネント ✅

ファイル: `src/components/GameRoom.tsx`

完全なゲームUI実装：

- WebSocket 接続管理
- リアルタイムメッセージ受信
- ゲーム状態表示
- インタラクティブなアクションボタン
- 手札表示
- ゲームログ表示

### ステップ 4: ホームページ・ルーティング ✅

ファイル:

- `src/app/page.tsx`: ルーム作成・参加フォーム
- `src/app/room/[roomId]/page.tsx`: 動的ルームページ

---

## 🚀 テスト実行手順

### 前提条件

- Node.js v18+
- npm インストール済み
- すべての依存パッケージがインストール済み

### ステップ 1: 開発サーバー起動

**方式A: 推奨（両方同時起動）**

```bash
npm run dev:all
```

これにより以下が起動します：

- Terminal 1: Next.js UI Server → `http://localhost:3000`
- Terminal 2: WebSocket Server → `ws://localhost:3001`

**方式B: 別々に起動**

```bash
# ターミナル 1
npm run dev

# ターミナル 2（別ウィンドウ）
npm run dev:ws
```

### ステップ 2: ブラウザで接続

1. **ブラウザを開く**
   - URL: `http://localhost:3000`

2. **ホームページ確認**
   - タイトル「ナショナルエコノミー メシア - オンライン対戦」が表示
   - ボタン: 「✨ 新規ルーム作成」
   - フォーム: ルームID入力

### ステップ 3: ゲーム開始（複数プレイヤーテスト）

#### テストシナリオ A: 新規ゲーム作成

**プレイヤー 1 (ブラウザ Tab 1)**

```
1. "✨ 新規ルーム作成" ボタンをクリック
   → ルームIDが生成される（例: "ABC123"）
   → 自動的にゲーム画面へ遷移

2. ゲーム画面で以下を確認:
   - プレイヤー一覧: "Player_XXXXX" が表示
   - ステータス: フェーズ = "lobby"
   - ボタン: "ゲーム開始準備" ボタンが有効
```

**プレイヤー 2 (ブラウザ Tab 2)**

```
1. 別のタブで `http://localhost:3000` にアクセス

2. 同じルームに参加:
   - フォーム: ルームID "ABC123" を入力
   - "参加" ボタンをクリック
   → Tab 1 と同じルームに参加

3. ゲームログ確認:
   - "✅ 接続成功: Player_XXXXX"
   - "👤 Player_XXXXX がゲームに参加しました"
```

#### テストシナリオ B: ゲーム開始

**Tab 1 と Tab 2 の両方で:**

```
1. "ゲーム開始準備" ボタンをクリック

2. 両方が準備完了すると:
   - ゲームログに "🎮 ゲーム開始！" が表示
   - フェーズが "ingame" に変更
   - ボタンが以下に変更:
     - 🎴 カードを引く
     - 💰 コイン獲得 (+5)
     - 🔄 ターン終了
   - ゲームログに "🔄 ターン変更: Player_XXXXX のターン（ラウンド 0）"
```

#### テストシナリオ C: アクション実行

**プレイヤー 1 のターンの場合:**

```
1. 🎴 カードを引く をクリック
   ゲームログに:
   - "⚡ Player_1 が「draw_card」を実行しました"
   - "🎴 手札が更新されました（3枚）"

2. 手札表示確認:
   - カードが表示される
   - 例: "農場" (コスト: 2, 効果: food+1)

3. 💰 コイン獲得 (+5) をクリック
   ゲームログに:
   - "💰 Player_1 がコイン獲得（現在: 10コイン）"

4. 手札のカードをクリック（カード建設）
   - 例: "農場" をクリック
   ゲームログに:
   - "🏗️ Player_1 が「農場」を建設しました"
   - プレイヤー一覧に "建物: 1" が更新

5. 🔄 ターン終了 をクリック
   - ゲームログに "🔄 ターン変更: Player_2 のターン"
```

**プレイヤー 2 のターン:**

```
1. Player 1 と同じアクションが可能
2. ボタンが有効になる
3. アクション実行後、ターン終了で Player 1 に戻る
```

---

## 🧪 期待される動作

### 接続テスト ✅

- [ ] WebSocket 接続成功のログが表示
- [ ] 複数プレイヤーの参加が同期される
- [ ] プレイヤー一覧が更新される

### ゲーム開始テスト ✅

- [ ] 両プレイヤーが準備完了で自動開始
- [ ] 初期ラウンド 0 から開始
- [ ] 初期手札 3 枚が配布される

### アクション実行テスト ✅

- [ ] カード引き: 手札が増える
- [ ] コイン獲得: コイン数が更新される
- [ ] カード建設: 建物数が増える
- [ ] ターン進行: プレイヤー切り替わり

### リアルタイム同期テスト ✅

- [ ] 1 プレイヤーのアクション → 他プレイヤーに即座に反映
- [ ] ゲームログがリアルタイムで更新
- [ ] 遅延なく状態同期される

---

## ⚠️ トラブルシューティング

### WebSocket 接続ができない

**症状**: "接続エラーが発生しました" メッセージ

**解決方法**:

```bash
# WebSocket サーバーが起動しているか確認
npm run dev:ws

# ターミナルに以下が表示されるはず:
# [Server] WebSocket server listening on ws://localhost:3001
```

### ゲームログが表示されない

**症状**: ログセクションが空白

**解決方法**:

1. ブラウザコンソール (F12) を開く
2. Network タブで WebSocket フレームを確認
3. サーバーターミナルで `[WebSocket]` ログを確認

### ボタンが動作しない

**症状**: ボタンをクリックしても反応がない

**解決方法**:

1. あなたのターンか確認（ゲームログのプレイヤー名確認）
2. ゲームフェーズが "ingame" か確認
3. ブラウザコンソールでエラーを確認

### 手札が表示されない

**症状**: 手札セクションが空白

**解決方法**:

1. "🎴 カードを引く" ボタンをクリック
2. ゲームログに "🎴 手札が更新されました" が表示されるか確認
3. サーバーターミナルで `[WebSocket]` ログを確認

---

## 📊 ログ例

### 正常な接続の場合

```
[14:30:15] ✅ 接続成功: Player_abc123
[14:30:16] 👤 Player_xyz789 がゲームに参加しました
[14:30:18] 🔔 プレイヤーが準備完了です
[14:30:19] 🎮 ゲーム開始！
[14:30:20] 🔄 ターン変更: Player_abc123 のターン（ラウンド 0）
[14:30:25] ⚡ Player_abc123 が「draw_card」を実行しました
[14:30:26] 🎴 手札が更新されました（3枚）
[14:30:30] 💰 Player_abc123 がコイン獲得（現在: 10コイン）
[14:30:35] 🏗️ Player_abc123 が「農場」を建設しました
[14:30:40] 🔄 ターン変更: Player_xyz789 のターン（ラウンド 0）
```

### サーバーログの確認

ターミナル 2 (WebSocket サーバー) の出力例:

```
[Server] WebSocket server listening on ws://localhost:3001
[Stats] {"totalRooms":1,"totalConnections":2,"rooms":[{"roomId":"ABC123","playerCount":2,"phase":"lobby"}]}
[WebSocket] New connection: roomId=ABC123, playerId=player_1, playerName=Player_abc123
[WebSocket] New connection: roomId=ABC123, playerId=player_2, playerName=Player_xyz789
[WebSocket] Player ready: player_1
[WebSocket] Player ready: player_2
[WebSocket] All players ready, starting game: ABC123
[WebSocket] Action from player_1: draw_card
```

---

## 🎯 次のステップ（Phase 4）

現在 Phase 3 が完了しました。次は Phase 4 で以下を実装します：

- [ ] 全カード効果の実装（50+ カード）
- [ ] リソース管理システムの拡張
- [ ] 建設チェーン（カード組み合わせボーナス）
- [ ] ラウンド処理（朝昼夜の処理）
- [ ] 最終得点計算ロジック

詳細は `IMPLEMENTATION_PLAN.md` の Phase 4 セクション参照。

---

## 📝 デバッグ Tips

### ブラウザコンソールでのデバッグ

```javascript
// WebSocket オブジェクトに直接アクセス
const ws = new WebSocket(
  "ws://localhost:3001?roomId=TEST01&playerId=p1&playerName=Test"
);

// メッセージ送信テスト
ws.send(
  JSON.stringify({
    type: "action",
    payload: {
      playerId: "p1",
      actionType: "draw_card",
      data: {},
    },
    timestamp: Date.now(),
  })
);

// メッセージ受信監視
ws.onmessage = (e) => console.log("Received:", JSON.parse(e.data));
```

### サーバーログの詳細確認

```bash
# 詳細ログを表示
npm run dev:ws 2>&1 | tee websocket.log

# ログを保存して後で確認
npm run dev:ws > websocket.log 2>&1 &
```

---

## ✨ 完了チェックリスト

- [x] GameState アクションメソッド実装
- [x] WebSocket アクションハンドラー実装
- [x] React GameRoom コンポーネント実装
- [x] ホームページ・ルーティング実装
- [x] ビルド成功
- [ ] ローカルテスト実行
- [ ] 複数プレイヤーテスト成功
- [ ] リアルタイム同期確認
- [ ] アクション実行確認

---

**Happy Testing! 🎮**
