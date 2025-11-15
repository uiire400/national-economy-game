# 実装ロードマップ - ナショナルエコノミー メシア

## 概要

本ドキュメントは、GAME_DESIGN.md で定義されたゲーム設計を、実装可能な具体的なステップに分解します。

---

## Phase 1：型定義と基本構造（目安：4-6時間）

### Task 1.1：types/index.ts を拡張

**変更内容**

```typescript
// 既存の Card インタフェース拡張
export interface Card {
  id: string;
  name: string;
  cost: number;
  effect: string;

  // 新規フィールド
  assetValue?: number; // 建物の資産価値（得点）
  category?: "public" | "private";
  endGameBonus?: string; // 終了時ボーナスID
  icon?: string; // 絵文字
}

// 新規インタフェース
export interface RoundCard {
  round: number;
  wagePerWorker: number;
  newPublicBuildingIds?: string[];
}

// Player 拡張
export interface Player {
  id: string;
  name: string;
  ready: boolean;
  coins: number;
  food: number;
  population: number;
  hand: Card[];
  buildings: Card[];

  // 新規フィールド
  workers: number; // 現在の労働者数（2～5）
  trainingWorkers: number; // 研修中（翌ラウンドで使用可）
  unpaidDebt: number; // 未払い賃金カード枚数
  victoryTokens: number; // 勝利点トークン
}
```

**ファイル**：`src/lib/types/index.ts`

### Task 1.2：CardDefs.ts に RoundCard 定義を追加

```typescript
export const ROUND_CARDS: RoundCard[] = [
  {
    round: 1,
    wagePerWorker: 2,
    newPublicBuildingIds: ["quarry", "school", "carpenter", "mine"],
  },
  { round: 2, wagePerWorker: 1, newPublicBuildingIds: ["shop"] },
  {
    round: 3,
    wagePerWorker: 2,
    newPublicBuildingIds: ["market", "high_school"],
  },
  // ... ラウンド9まで
];

export const GAME_CONFIG = {
  TOTAL_ROUNDS: 9,
  MIN_WORKERS: 2,
  MAX_WORKERS: 5,
  MAX_HAND_SIZE: 5,
  UNPAID_DEBT_PENALTY: 3, // 未払い賃金1枚=-3点
};
```

**ファイル**：`src/lib/game/CardDefs.ts`

### Task 1.3：GameState を拡張

**新規メソッド**

```typescript
// ラウンド開始
startRound(roundNumber: number): void

// ワーカープレイスメント
placeWorker(playerId: string, workplaceId: string): void
passRound(playerId: string): void

// ラウンド終了処理
endRound(): void
payWages(playerId: string): void

// スコア計算
calculateFinalScore(playerId: string): number
```

**ファイル**：`src/lib/game/GameState.ts`

---

## Phase 2：賃金・経済メカニクス（目安：4-5時間）

### Task 2.1：ラウンド終了処理の実装

**処理フロー**

```typescript
endRound() {
  // 1. 各プレイヤーの労働者を手元に戻す
  this.players.forEach(player => {
    // 労働者の配置を解除（職場から戻す）
  });

  // 2. 賃金支払い
  this.players.forEach(player => {
    const wage = this.currentRoundCard.wagePerWorker * player.workers;
    if (player.coins >= wage) {
      player.coins -= wage;
      this.household += wage;
    } else {
      // 建物売却処理へ
      this.handleInsufficientFunds(player, wage);
    }
  });

  // 3. 手札が6枚以上のプレイヤーは5枚に調整（UIで指示）

  // 4. ラウンドカード更新
  this.round++;
  this.currentRoundCard = ROUND_CARDS[this.round - 1];

  // 5. 新しい公共職場カードを配置
  this.addPublicWorkplaces(this.currentRoundCard.newPublicBuildingIds);
}
```

### Task 2.2：建物売却処理

```typescript
sellBuilding(playerId: string, buildingId: string): void {
  const player = this.players.get(playerId);
  const building = player.buildings.find(b => b.id === buildingId);

  if (!building) return;

  // サプライからお金を取得
  player.coins += building.assetValue;

  // 建物を移動（公共職場へ）
  player.buildings = player.buildings.filter(b => b.id !== buildingId);
  this.publicWorkplaces.set(buildingId, building);
}

handleInsufficientFunds(player: Player, wageAmount: number): void {
  let remaining = wageAmount - player.coins;
  player.coins = 0;

  // 売却可能な建物を売却（UI で選択）
  // ... 売却処理

  // それでも足りない場合
  if (remaining > 0) {
    player.unpaidDebt += Math.ceil(remaining / 1);  // $1 = 1枚
    this.household += Math.min(remaining, 0);  // 支払えた分を家計に
  }
}
```

**ファイル**：`src/lib/game/GameState.ts`

### Task 2.3：職場機能の実行

```typescript
executeWorkplaceFunction(
  playerId: string,
  workplaceId: string,
  discardedCardIds?: string[]
): void {
  const workplace = this.getWorkplace(workplaceId);
  const player = this.players.get(playerId);

  switch (workplace.effect) {
    case 'gain_coins_6':
      // 1枚捨て → $6獲得
      this.discardCards(player, discardedCardIds, 1);
      player.coins += Math.min(6, this.household);
      this.household -= 6;
      break;

    case 'gain_coins_12':
      // 2枚捨て → $12獲得
      this.discardCards(player, discardedCardIds, 2);
      player.coins += Math.min(12, this.household);
      this.household -= 12;
      break;

    case 'hire_worker':
      // 労働者雇用
      if (player.workers < 5) {
        player.trainingWorkers++;
      }
      break;

    // ... 他の機能
  }
}
```

---

## Phase 3：スコアリング（目安：2-3時間）

### Task 3.1：最終スコア計算

```typescript
calculateFinalScore(playerId: string): {
  buildings: number;
  endGameBonus: number;
  coins: number;
  victoryTokens: number;
  unpaidDebtPenalty: number;
  total: number;
} {
  const player = this.players.get(playerId);

  let score = 0;
  const breakdown = {
    buildings: 0,
    endGameBonus: 0,
    coins: 0,
    victoryTokens: 0,
    unpaidDebtPenalty: 0,
    total: 0,
  };

  // 1. 建物の資産価値
  breakdown.buildings = player.buildings.reduce((sum, b) => sum + (b.assetValue || 0), 0);
  score += breakdown.buildings;

  // 2. 建物の終了時ボーナス
  player.buildings.forEach(building => {
    if (building.endGameBonus) {
      const bonus = this.calculateBuildingEndGameBonus(building, player);
      breakdown.endGameBonus += bonus;
      score += bonus;
    }
  });

  // 3. 所持金
  breakdown.coins = player.coins;
  score += player.coins;

  // 4. 勝利点トークン
  const fullSets = Math.floor(player.victoryTokens / 3);
  const remaining = player.victoryTokens % 3;
  breakdown.victoryTokens = fullSets * 10 + remaining;
  score += breakdown.victoryTokens;

  // 5. 未払い賃金（減点）
  breakdown.unpaidDebtPenalty = -player.unpaidDebt * 3;
  score += breakdown.unpaidDebtPenalty;

  breakdown.total = score;
  return breakdown;
}

calculateGameResults(): {
  ranking: Array<{ playerId: string; name: string; score: number }>;
  winner: string;
} {
  const scores = Array.from(this.players.keys()).map(id => ({
    playerId: id,
    name: this.players.get(id).name,
    score: this.calculateFinalScore(id).total,
  }));

  scores.sort((a, b) => b.score - a.score);

  return {
    ranking: scores,
    winner: scores[0].playerId,
  };
}
```

**ファイル**：`src/lib/game/GameState.ts`

---

## Phase 4：UI 更新（目安：4-6時間）

### Task 4.1：GameRoom.tsx のステータスバー拡張

**更新箇所**

```typescript
// ステータスバーに追加表示
- 現在ラウンド数（XX/9）
- ラウンド賃金（$X/人）
- 労働者数（現在/最大）
- 未払い賃金カード枚数
- 勝利点トークン枚数
```

### Task 4.2：公共職場配置エリア

**UI コンポーネント**

```
【中央エリア - テーブルレイアウト】
┌─ ラウンドカード表示
│  └─ 賃金情報
├─ 公共職場グリッド
│  ├─ 初期職場 (採石場、学校、大工、鉱山)
│  └─ 毎ラウンド追加される職場
└─ 労働者配置インジケータ
```

### Task 4.3：賃金支払いモーダル

**処理フロー**

```
ラウンド終了時：
1. 必要な賃金を表示
2. 所持金が不足している場合：
   ├─ 売却可能な建物をリスト表示
   ├─ クリックで売却 → お金獲得
   └─ 不足額に応じて未払い賃金警告
3. 手札が6枚以上の場合：
   ├─ 5枚になるまで選択して捨て場へ
```

### Task 4.4：最終スコア表示画面

**ゲーム終了画面**

```
┌─ 優勝者表示（🏆付き）
├─ スコアボード
│  └─ 各プレイヤーのスコア内訳
│     ├─ 建物資産価値
│     ├─ 終了時ボーナス
│     ├─ 所持金
│     ├─ 勝利点
│     └─ 未払い賃金ペナルティ
└─ 「ゲーム終了」ボタン
```

---

## 実装チェックリスト

- [ ] Task 1.1: `types/index.ts` 拡張
- [ ] Task 1.2: `CardDefs.ts` に RoundCard 定義
- [ ] Task 1.3: `GameState.ts` にメソッド追加
- [ ] Task 2.1: ラウンド終了処理実装
- [ ] Task 2.2: 建物売却処理実装
- [ ] Task 2.3: 職場機能実装
- [ ] Task 3.1: スコア計算実装
- [ ] Task 4.1: ステータスバー拡張
- [ ] Task 4.2: 公共職場 UI
- [ ] Task 4.3: 賃金支払いモーダル
- [ ] Task 4.4: スコア表示画面
- [ ] ビルド確認 & デバッグ
- [ ] 統合テスト（複数プレイヤーでラウンド進行）

---

## 推定実装時間

- Phase 1（型定義）：5-6時間
- Phase 2（経済メカニクス）：6-8時間
- Phase 3（スコアリング）：3-4時間
- Phase 4（UI）：5-7時間

**合計：19-25時間**

---

## 注記

- 各 Phase は並行で開発可能な部分もあります
- UI の手札整理など、複雑なモーダルは後回しにして基本フロー完成後に実装
- サーバー側（GameState）の完成度を UI より優先
