# ナショナルエコノミー メシア - 実装計画書

## 🎯 プロジェクト目標

オンライン対戦版「ナショナルエコノミー メシア」を実装する

- 2〜4人対応
- DB なし、Vercel 無料枠対応
- WebSocket によるリアルタイム通信
- メモリ上でゲーム状態を完全管理

---

## 📊 実装フェーズ詳細

### **Phase 1: 基盤整備（完了）** ✅

**目的**  
WebSocket で複数プレイヤーが接続でき、ルーム管理ができる状態を実現

**実装内容**

- [x] Next.js プロジェクト初期化
- [x] WebSocket サーバー実装（`server.ts`）
- [x] ルーム管理システム（`RoomManager.ts`）
- [x] ルーム作成・参加・退出機能
- [x] Heart-beat（5秒ごとの ping/pong）
- [x] プレイヤー接続管理
- [x] TypeScript 型定義

**成果物**

```
src/
├── lib/
│   ├── game/
│   │   ├── RoomManager.ts
│   │   └── GameState.ts（スケルトン）
│   └── types/
│       └── index.ts
├── app/
│   ├── layout.tsx
│   └── page.tsx
server.ts
package.json
tsconfig.json
```

**テスト方法**

```bash
npm run dev:ws
# ws://localhost:3001?roomId=TEST01&playerId=p1&playerName=Alice
# 複数のタブで接続してみる
```

---

### **Phase 2: GameState 基礎（完了）** ✅

**目的**  
ゲーム状態をサーバー側で完全に管理できる基盤を構築

**実装内容**

- [x] GameState クラス設計
  - プレイヤー管理（Map<playerId, Player>）
  - 山札・手札・捨て札管理
  - ターン管理（currentPlayerIndex, round）
  - ゲームフェーズ管理（lobby/ingame/finished）

- [x] 初期化処理
  - ルーム作成時に GameState を生成
  - ゲーム開始時に初期手札配布
  - 山札シャッフル

- [x] 基本メソッド
  - `addPlayer()`: プレイヤー追加
  - `removePlayer()`: プレイヤー削除
  - `initializeGame()`: ゲーム初期化
  - `drawCards()`: カード引き
  - `nextTurn()`: ターン進行
  - `toJSON()`: 状態シリアライズ

**成果物**

```typescript
// GameState.ts - 完全な型定義と基本実装
class GameState {
  roomId: string;
  players: Map<string, Player>;
  deck: Card[];
  discard: Card[];
  // ... 20個以上のメソッド
}
```

**テスト方法**

```typescript
// Node.js REPL
const gameState = new GameState("ROOM01");
gameState.addPlayer("p1", "Alice");
gameState.addPlayer("p2", "Bob");
gameState.initializeGame();
console.log(gameState.toJSON());
```

---

### **Phase 3: ミニマムゲーム（β版）** ✅ 完了

**目的**  
最小限のルールで実際にゲームが進行する状態を実現  
→ テストプレイで接続・ターン進行・アクション実行が確認できる

**実装内容**

#### 3.1 ターン処理の完成

```typescript
// GameState.ts 拡張
nextTurn(): void {
  this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size
  if (this.currentPlayerIndex === 0) {
    this.round++
    if (this.round >= this.maxRounds) {
      this.phase = 'finished'
    }
  }
}

// server.ts で 'next_turn' アクション実装
case 'next_turn':
  if (room.getCurrentPlayer()?.id === playerId) {
    room.nextTurn()
    roomManager.broadcastToRoom(room.roomId, {
      type: 'turn_changed',
      payload: {
        currentPlayer: room.getCurrentPlayer(),
        round: room.round,
        gameState: room.toJSON()
      },
      timestamp: Date.now()
    })
  }
  break
```

#### 3.2 簡易アクション実装（3-5個）

**アクション A: カード引く（draw_card）**

```typescript
case 'draw_card':
  if (room.getCurrentPlayer()?.id === playerId) {
    const player = room.players.get(playerId)!
    const drawn = room.drawCards(1)
    player.hand.push(...drawn)

    // プレイヤーに個別通知
    roomManager.sendToPlayer(room.roomId, playerId, {
      type: 'hand_updated',
      payload: { hand: player.hand },
      timestamp: Date.now()
    })

    // 全員に状態通知
    roomManager.broadcastToRoom(room.roomId, {
      type: 'game_state_updated',
      payload: { gameState: room.toJSON() },
      timestamp: Date.now()
    })
  }
  break
```

**アクション B: コイン獲得（gain_coins）**

```typescript
case 'gain_coins':
  const player = room.players.get(playerId)!
  player.coins += 5  // 固定値で最初はOK
  roomManager.broadcastToRoom(room.roomId, {
    type: 'resource_updated',
    payload: {
      playerId,
      coins: player.coins,
      gameState: room.toJSON()
    },
    timestamp: Date.now()
  })
  break
```

**アクション C: カード建設（build_card）**

```typescript
// data.cardId をプレイヤーの手札から buildings に移す
case 'build_card':
  const { cardId } = data as { cardId: string }
  const player = room.players.get(playerId)!
  const cardIndex = player.hand.findIndex(c => c.id === cardId)
  if (cardIndex >= 0) {
    const card = player.hand.splice(cardIndex, 1)[0]
    player.buildings.push(card)
    player.coins -= card.cost

    roomManager.sendToPlayer(room.roomId, playerId, {
      type: 'hand_updated',
      payload: { hand: player.hand },
      timestamp: Date.now()
    })

    roomManager.broadcastToRoom(room.roomId, {
      type: 'building_built',
      payload: {
        playerId,
        card,
        gameState: room.toJSON()
      },
      timestamp: Date.now()
    })
  }
  break
```

#### 3.3 クライアント側の実装（React）

**新ファイル: `src/components/GameRoom.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'

interface Player {
  id: string
  name: string
  coins: number
  hand: Card[]
  buildings: Card[]
}

export default function GameRoom({ roomId }: { roomId: string }) {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [gameLog, setGameLog] = useState<string[]>([])

  useEffect(() => {
    const playerId = `player_${Math.random().toString(36).substr(2, 9)}`
    const playerName = `Player_${Math.random().toString(36).substr(2, 5)}`

    const websocket = new WebSocket(
      `ws://localhost:3001/?roomId=${roomId}&playerId=${playerId}&playerName=${playerName}`
    )

    websocket.onopen = () => {
      addLog(`✓ Connected as ${playerName}`)
      setWs(websocket)
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'ping':
          websocket.send(JSON.stringify({
            type: 'pong',
            payload: {},
            timestamp: Date.now()
          }))
          break

        case 'player_joined':
          addLog(`👤 ${message.payload.playerName} joined`)
          setPlayers(message.payload.players)
          break

        case 'player_ready':
          setPlayers(message.payload.players)
          break

        case 'game_started':
          addLog('🎮 Game started!')
          setCurrentPlayer(message.payload.currentPlayer)
          break

        case 'turn_changed':
          addLog(`🔄 Turn: ${message.payload.currentPlayer.name}`)
          setCurrentPlayer(message.payload.currentPlayer)
          break

        case 'game_state_updated':
          // 状態更新
          break
      }
    }

    return () => {
      websocket.close()
    }
  }, [roomId])

  const addLog = (message: string) => {
    setGameLog(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`
    ])
  }

  const handleReady = () => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'ready',
        payload: { playerId: 'current_player_id' },
        timestamp: Date.now()
      }))
    }
  }

  const handleDrawCard = () => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'action',
        payload: {
          playerId: 'current_player_id',
          actionType: 'draw_card',
          data: {}
        },
        timestamp: Date.now()
      }))
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Room: {roomId}</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Players</h2>
        <ul>
          {players.map(p => (
            <li key={p.id}>
              {p.name} - Coins: {p.coins}, Hand: {p.hand.length}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Actions</h2>
        <button onClick={handleReady}>Ready</button>
        <button onClick={handleDrawCard}>Draw Card</button>
      </div>

      <div style={{
        marginBottom: '20px',
        border: '1px solid #ccc',
        padding: '10px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <h2>Game Log</h2>
        {gameLog.map((log, i) => (
          <div key={i} style={{ fontSize: '12px' }}>{log}</div>
        ))}
      </div>
    </div>
  )
}
```

**新ファイル: `src/app/room/[roomId]/page.tsx`**

```typescript
import GameRoom from '@/components/GameRoom'

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <GameRoom roomId={params.roomId} />
}
```

#### 3.4 テスト計画

```bash
# ターミナル 1: WebSocket サーバー起動
npm run dev:ws

# ターミナル 2: Next.js UI 起動
npm run dev

# ブラウザで複数タブを開く
# http://localhost:3000/room/TEST01

# テストシナリオ:
# 1. Tab 1, Tab 2 で接続
# 2. Tab 1, Tab 2 が表示される
# 3. 両方が "Ready" をクリック
# 4. ゲーム開始
# 5. ターンが回る
# 6. "Draw Card" でカード引き
```

**完了条件**

- [x] 複数プレイヤーが接続可能
- [x] ゲーム開始可能（全員 ready）
- [x] ターン進行可能
- [x] アクション実行可能
- [x] リアルタイム状態同期可能

---

### **Phase 4: 正式ルール実装** 📅 その次

**目的**  
完全なゲームルール実装

**実装内容**

- [ ] 全カード効果の実装（50+ カード）
- [ ] リソース管理システム
- [ ] 建設チェーン（カード組み合わせボーナス）
- [ ] ラウンド処理（朝昼夜の処理）
- [ ] 最終得点計算

---

### **Phase 5: UI/UX 改善** 📅 その次

**目的**  
プロフェッショナルなゲーム画面実装

**実装内容**

- [ ] ゲーム盤面デザイン
- [ ] カード画像表示
- [ ] ドラッグ&ドロップ
- [ ] アニメーション
- [ ] リスポンシブ対応

---

### **Phase 6: 負荷・運用改善** 📅 その次

**目的**  
本番環境対応

**実装内容**

- [ ] メモリ最適化
- [ ] キャッシュ戦略
- [ ] ロギング・監視
- [ ] DB 導入（Redis/Supabase）への移行パス

---

## 🔧 Phase 3 の実装手順（ステップバイステップ）

### ステップ 1: GameState にアクションメソッドを追加

**ファイル**: `src/lib/game/GameState.ts`

```typescript
// メソッドを追加
drawCard(playerId: string): Card[] {
  const player = this.players.get(playerId)
  if (!player) return []
  const drawn = this.drawCards(1)
  player.hand.push(...drawn)
  return drawn
}

gainCoins(playerId: string, amount: number): number {
  const player = this.players.get(playerId)
  if (!player) return 0
  player.coins += amount
  return player.coins
}

buildBuilding(playerId: string, cardId: string): boolean {
  const player = this.players.get(playerId)
  if (!player) return false

  const cardIndex = player.hand.findIndex(c => c.id === cardId)
  if (cardIndex < 0) return false

  const card = player.hand[cardIndex]
  if (player.coins < card.cost) return false

  player.hand.splice(cardIndex, 1)
  player.buildings.push(card)
  player.coins -= card.cost

  return true
}
```

### ステップ 2: server.ts の handleAction にアクションを追加

**ファイル**: `server.ts`

```typescript
case 'draw_card': {
  const drawn = room.drawCard(playerId)

  roomManager.sendToPlayer(room.roomId, playerId, {
    type: 'hand_updated',
    payload: { hand: room.players.get(playerId)?.hand },
    timestamp: Date.now()
  })

  roomManager.broadcastToRoom(room.roomId, {
    type: 'action_executed',
    payload: {
      playerId,
      action: 'draw_card',
      cardCount: drawn.length,
      gameState: room.toJSON()
    },
    timestamp: Date.now()
  })
  break
}
```

### ステップ 3: クライアント React コンポーネント実装

**ファイル**: `src/components/GameRoom.tsx`

完全実装（上記参照）

### ステップ 4: テスト実行

```bash
npm run dev:all
# ブラウザで複数タブから接続してテスト
```

---

## 📈 推定時間と難度

| フェーズ | 予想時間   | 難度       | 状態    |
| -------- | ---------- | ---------- | ------- |
| Phase 1  | 2-3h       | ⭐⭐       | ✅ 完了 |
| Phase 2  | 1-2h       | ⭐⭐       | ✅ 完了 |
| Phase 3  | 3-4h       | ⭐⭐⭐     | 🔄 次   |
| Phase 4  | 6-8h       | ⭐⭐⭐⭐   | 📅 予定 |
| Phase 5  | 5-8h       | ⭐⭐⭐⭐⭐ | 📅 予定 |
| Phase 6  | 3-5h       | ⭐⭐⭐     | 📅 予定 |
| **合計** | **20-30h** | -          | -       |

---

## 🚀 デプロイメント計画

### ローカル開発環境（現在）

- Next.js: `:3000`
- WebSocket: `:3001`

### 本番環境（Vercel）

Option 1: Socket.io 導入

```bash
npm install socket.io express
npm install --save-dev @types/express
```

Option 2: 外部サーバーホスト

- WebSocket: Railway.app / Render.com
- UI: Vercel

---

## ✅ チェックリスト

- [x] Phase 1 実装完了
- [x] Phase 2 実装完了
- [x] Phase 3 実装完了
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
