# ナショナルエコノミー メシア - ゲーム設計ドキュメント

## 概要

本ドキュメントは、ボードゲーム「ナショナルエコノミー メシア」をオンライン化するための技術設計を記述します。

**ゲーム基本情報**

- プレイ人数：2～4人
- ゲーム時間：30～45分
- ラウンド数：9ラウンド
- メカニクス：ワーカープレイスメント、建物建設、資源管理

---

## 1. ゲーム状態の構造

### 1.1 Player（拡張版）

```typescript
interface Player {
  id: string;
  name: string;
  ready: boolean;

  // 経済状態
  coins: number; // 現在所持金
  workers: number; // 雇用済み労働者数（2～5）
  trainingWorkers: number; // 研修中の労働者数

  // 資産
  buildings: Card[]; // 建設済み建物カード
  hand: Card[]; // 手札（建物カード+消費財カード）

  // 負債管理
  unpaidDebt: number; // 未払い賃金カード枚数

  // スコア計算用
  victoryTokens: number; // 勝利点トークン枚数
}
```

### 1.2 RoundCard（新規）

```typescript
interface RoundCard {
  id: string;
  round: number; // ラウンド番号（1～9）
  wagePerWorker: number; // 労働者1人あたりの賃金
  newPublicBuildings: string[]; // このラウンドで追加される公共職場カードID
}
```

**ラウンドカード一覧**

| ラウンド | 賃金 | 追加建物                 | 説明                         |
| -------- | ---- | ------------------------ | ---------------------------- |
| 1        | $2   | 採石場・学校・大工・鉱山 | ゲーム開始、初期公共職場配置 |
| 2        | $1   | 盤店                     | 1枚捨て→$6獲得               |
| 3        | $2   | 市場                     | 2枚捨て→$12獲得              |
| 3        | $2   | 高等学校                 | 労働者→4人                   |
| 3        | $2   | スーパー                 | 3枚捨て→$18獲得              |
| 4        | $1   | 大学                     | 労働者→5人                   |
| 4        | $1   | 百貨店                   | 4枚捨て→$24獲得              |
| 5        | $1   | 専門学校                 | 労働者+1追加                 |
| 5        | $1   | 万博                     | 5枚捨て→$30獲得              |

### 1.3 GameState（拡張版）

```typescript
interface GameState {
  roomId: string;
  players: Map<string, Player>;
  round: number; // 現在ラウンド（1～9）
  currentPlayerIndex: number; // 現在手番のプレイヤーインデックス

  // ゲーム管理
  phase: "lobby" | "workplacement" | "roundend" | "finished";

  // カード管理
  buildingDeck: Card[]; // 建物カード山札
  buildingDiscard: Card[]; // 建物カード捨て札
  consumableCards: Card[]; // 消費財カードの山

  // 職場管理
  publicWorkplaces: Map<string, Card>; // テーブル中央の公共職場
  playerWorkplaces: Map<string, WorkplaceState>; // プレイヤー個別領域

  // 経済管理
  household: number; // 家計（ゲーム内流通）
  supply: number; // サプライ（無限）

  // ラウンド管理
  roundCards: RoundCard[];
  playersPassedThisRound: Set<string>; // 今ラウンドでパスしたプレイヤー
}
```

---

## 2. ゲームフロー

### 2.1 各ラウンドの流れ

```
1. ラウンド開始処理
   ├─ 新しい公共職場カードをテーブルに配置
   └─ 全プレイヤーの労働者を手元に戻す

2. ワーカープレイスメント フェーズ
   ├─ スタートプレイヤーから時計回り
   ├─ 各プレイヤー：
   │  ├─ 労働者1人を職場に配置
   │  ├─ その職場の機能を実行
   │  └─ または パス（その後スキップ）
   └─ 全員パスまで繰り返し

3. ラウンド終了処理
   ├─ 各プレイヤー：
   │  ├─ 労働者数 × ラウンド賃金 を家計に支払い
   │  │  ├─ 所持金が不足：建物を売却
   │  │  └─ 売却後も不足：未払い賃金カード取得
   │  └─ 手札が6枚以上：5枚になるまで捨てる
   └─ 次ラウンドカードをめくり公開
```

### 2.2 職場の機能分類

**1. 建物建設系**

- 機能：「建物を作る」職場を使用
- 手札から指定枚数のカードを捨て、建物カード1枚を建設
- コスト削減機能あり

**2. 資源獲得系**

- 盤店：1枚捨て→家計から$6
- 市場：2枚捨て→家計から$12
- スーパー：3枚捨て→家計から$18
- 百貨店：4枚捨て→家計から$24
- 万博：5枚捨て→家計から$30

**3. 労働者雇用系**

- 学校：労働者数を3→4人に
- 高等学校：労働者数を4人に
- 大学：労働者数を5人に
- 専門学校：労働者+1追加（次ラウンドから使用可）

**4. 参照職場**

- 採石場・鉱山・学校：参照カード（特定の機能あり）
- 大工：コスト削減機能

---

## 3. 経済メカニズム

### 3.1 家計 vs サプライ

| 項目   | 家計（Household）                    | サプライ（Supply）   |
| ------ | ------------------------------------ | -------------------- |
| 説明   | ゲーム内流通のお金                   | ゲーム外のお金       |
| 用途   | 労働者への賃金支払い、職場機能で獲得 | 建物売却時の受け取り |
| 再生産 | 労働者賃金の支払いで復帰             | 無限                 |

### 3.2 ラウンド終了時の賃金支払い

```
支払い額 = 労働者数 × ラウンドカード記載賃金

例）ラウンド1、労働者3人の場合
支払い額 = 3 × $2 = $6
```

**不足時の処理**

```
if (所持金 < 支払い額) {
  // 1. 建物売却でお金を獲得
  建物の資産価値 = お金に換算（サプライから）
  売却した建物 → 公共職場へ移動

  // 2. それでも不足
  未払い賃金カード += 不足額 ÷ 1
}
```

### 3.3 両替ルール

- ゲーム中いつでも両替可能
- 家計・サプライの総量は変わらない

---

## 4. スコアリング計算

**ゲーム終了時の得点計算**

```typescript
score = 0;

// 1. 建物の資産価値
score += buildings.reduce((sum, b) => sum + b.assetValue, 0);

// 2. 建物の終了時ボーナス
buildings.forEach((building) => {
  if (building.hasEndGameBonus) {
    score += building.calculateEndGameBonus();
  }
});

// 3. 所持金
score += coins; // $1 = 1点

// 4. 勝利点トークン
const fullSets = Math.floor(victoryTokens / 3);
const remaining = victoryTokens % 3;
score += fullSets * 10 + remaining;

// 5. 未払い賃金（減点）
score -= unpaidDebt * 3;
```

---

## 5. 職場カード定義

### 5.1 カード構造の拡張

```typescript
interface Building extends Card {
  id: string;
  name: string;
  cost: number; // 建設コスト（捨てるカード枚数）
  assetValue: number; // 資産価値（得点）
  effect: string; // 効果ID

  // ナショナルエコノミー固有
  category: "public" | "private"; // 公共職場 or プライベート
  function: BuildingFunction; // 機能定義

  // 可変コスト
  baseCost: number; // 基本コスト
  costModifier?: {
    // コスト削減条件
    condition: string; // 条件ID
    reduction: number; // 削減額
  };

  // ゲーム終了時の処理
  endGameBonus?: {
    type: "fixed" | "variable";
    calculate: (player: Player) => number;
  };

  // アイコン（カテゴリ識別）
  icon: string; // '🏭' | '🏪' | '📚' など
}

interface BuildingFunction {
  type: "build" | "gain_resources" | "hire_workers" | "special";
  execute: (player: Player, gameState: GameState) => void;
}
```

### 5.2 カード一覧テンプレート

**建物カード（例）**

| ID         | 名称   | コスト | 資産価値 | 機能            |
| ---------- | ------ | ------ | -------- | --------------- |
| quarry     | 採石場 | -      | -        | 参照カード      |
| stone_mill | 製粉所 | 1      | 2        | 建設時+建物参照 |
| school     | 学校   | 2      | 2        | 労働者→3人      |
| market     | 市場   | 2      | 3        | 2枚捨て→$12     |
| factory    | 工場   | 4      | 5        | 建設時+特殊効果 |

---

## 6. WebSocket メッセージ拡張

### 6.1 新しいアクションタイプ

```typescript
// WorkerPlacement：職場に労働者を配置
{
  type: 'action',
  payload: {
    playerId: string;
    actionType: 'place_worker';
    data: {
      workplaceId: string;  // 職場ID
    }
  }
}

// Pass：ラウンドで以降パス
{
  type: 'action',
  payload: {
    playerId: string;
    actionType: 'pass';
    data: {}
  }
}

// SellBuilding：建物売却
{
  type: 'action',
  payload: {
    playerId: string;
    actionType: 'sell_building';
    data: {
      buildingId: string;
    }
  }
}

// DiscardCards：手札から捨てる
{
  type: 'action',
  payload: {
    playerId: string;
    actionType: 'discard_cards';
    data: {
      cardIds: string[];
    }
  }
}
```

### 6.2 ブロードキャストメッセージ

```typescript
// WorkerPlaced：職場に労働者が配置された
{
  type: "worker_placed";
  payload: {
    playerId: string;
    workplaceId: string;
    workplaceFunction: string;
  }
}

// RoundEnded：ラウンド終了処理完了
{
  type: "round_ended";
  payload: {
    roundNumber: number;
    nextRoundCard: RoundCard;
    playerStates: Array<{
      playerId: string;
      coins: number;
      workers: number;
      unpaidDebt: number;
    }>;
  }
}

// GameEnded：ゲーム終了
{
  type: "game_ended";
  payload: {
    scores: Array<{
      playerId: string;
      name: string;
      finalScore: number;
      breakdown: {
        buildings: number;
        endGameBonus: number;
        coins: number;
        victoryTokens: number;
        unpaidDebtPenalty: number;
      };
    }>;
    winner: string;
  }
}
```

---

## 7. GameState メソッド（新規）

### 7.1 ワーカープレイスメント関連

```typescript
// 職場に労働者を配置
placeWorker(playerId: string, workplaceId: string): void

// プレイヤーがラウンドでパス
passRound(playerId: string): void

// ラウンド終了処理をトリガー
endRound(): void
```

### 7.2 賃金・経済関連

```typescript
// ラウンド終了時の賃金計算と支払い
payWages(playerId: string, wagePerWorker: number): PaymentResult

// 建物を売却
sellBuilding(playerId: string, buildingId: string): void

// 所持金不足時に未払い賃金を記録
recordUnpaidDebt(playerId: string, amount: number): void
```

### 7.3 スコア計算

```typescript
// 最終スコアを計算
calculateFinalScore(playerId: string): ScoreBreakdown

// 全プレイヤーのスコアを計算してランキング生成
calculateGameResults(): GameResult
```

### 7.4 職場機能実行

```typescript
// 職場の機能を実行
executeWorkplaceFunction(
  playerId: string,
  workplaceId: string,
  cardIds?: string[]  // 捨てるカードのID
): FunctionResult
```

---

## 8. UI更新ガイドライン

### 8.1 ゲーム画面に追加する情報表示

```
【ステータスバー】
- ラウンド番号（現在/9）
- 労働者数（現在/5）
- 所持金
- 未払い賃金枚数
- 勝利点トークン数

【中央エリア】
- 現在のラウンドカード（賃金表示）
- 公共職場の並び
  └ テーブルに出ている全ての職場カード

【プレイヤーエリア】
- 各プレイヤーの状態表示
  ├─ 労働者数
  ├─ 所持金
  ├─ 建物数
  └─ ステータス（アクティブ/パス/終了）

【手札エリア】
- 建物カード + 消費財カード混在
- カード総数表示（現在/5）

【建物領域】
- プレイヤーが建設した建物一覧
- 各建物のアイコン・名称・資産価値表示
```

### 8.2 アクション UI

```
【ワーカープレイスメント時】
- 職場一覧から選択可能な職場をハイライト
- クリック → 労働者配置 + 機能実行

【賃金支払い不足時】
- 売却可能な建物をハイライト
- 売却数に応じてお金計算表示
- 不足額表示 + 未払い賃金枚数警告

【手札整理時】
- 手札が6枚以上のとき捨てるモーダル表示
- 5枚になるまで選択してドラッグ&ドロップ
```

---

## 9. 実装優先度

### Phase 1（基本フロー）

1. Player・RoundCard・GameState 型拡張
2. ラウンド開始・終了処理の実装
3. ワーカープレイスメント基本フロー
4. 賃金支払い処理

### Phase 2（経済メカニクス）

1. 建物売却・未払い賃金システム
2. 職場機能の実行（建設、資源獲得、労働者雇用）
3. 手札管理（6枚制限、捨て札）

### Phase 3（スコアリング）

1. 最終スコア計算ロジック
2. 得点内訳の詳細表示
3. ゲーム終了画面

### Phase 4（UI/UX）

1. ステータスバー拡張
2. 公共職場配置のビジュアル
3. 賃金支払いの可視化
4. スコアボード表示

---

## 10. 次のステップ

1. 本ドキュメントをベースに `types/index.ts` を拡張
2. `CardDefs.ts` にナショナルエコノミーのカード定義を追加
3. `GameState.ts` に新しいメソッドを実装
4. Phase 1 のテストを実施
