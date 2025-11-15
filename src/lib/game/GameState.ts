/**
 * GameState.ts
 * ゲーム状態の管理
 */

import { Card, Player, RoundCard, ScoreBreakdown, GameResults } from "../types";
import {
  ROUND_CARDS,
  GAME_CONFIG,
  CONSUMABLE_CARDS,
  INITIAL_PUBLIC_CARDS,
} from "./CardDefs";

export class GameState {
  roomId: string;
  players: Map<string, Player> = new Map();
  deck: Card[] = [];
  discard: Card[] = [];
  consumableDeck: Card[] = []; // 消費財デッキ
  consumableDiscard: Card[] = []; // 消費財捨て札
  currentPlayerIndex: number = 0;
  round: number = 1;
  phase: "lobby" | "ingame" | "finished" = "lobby";
  maxRounds: number = GAME_CONFIG.TOTAL_ROUNDS;
  createdAt: number = Date.now();

  // ラウンド・経済管理
  currentRoundCard: RoundCard = ROUND_CARDS[0];
  household: number = 0; // 家計（共通基金）
  supply: number = 100; // サプライ（外部銀行）
  placedWorkers: Map<string, Map<string, number>> = new Map(); // playerId -> { workplaceId -> count }
  // 公共職場カード（テーブル中央に表示されるカード群）
  publicCards: Card[] = [];

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  addPlayer(playerId: string, playerName: string): Player {
    const player: Player = {
      id: playerId,
      name: playerName,
      ready: false,
      coins: 5,
      food: 0,
      population: 1,
      hand: [],
      buildings: [],
      workers: 2,
      trainingWorkers: 0,
      unpaidDebt: 0,
      victoryTokens: 0,
    };
    this.players.set(playerId, player);
    return player;
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  /**
   * すべてのプレイヤーが ready か確認
   */
  isAllReady(): boolean {
    if (this.players.size === 0) return false;
    return Array.from(this.players.values()).every((p) => p.ready);
  }

  /**
   * ゲーム開始時の初期化処理
   */
  initializeGame(): void {
    this.phase = "ingame";
    this.round = 1;
    this.currentRoundCard = ROUND_CARDS[0];
    this.currentPlayerIndex = 0;
    this.household = 0;
    this.supply = 100;

    // プレイヤー順をシャッフルして所持金を設定
    this.shufflePlayerOrder();

    // ワーカー配置情報の初期化
    this.players.forEach((player) => {
      this.placedWorkers.set(player.id, new Map());
    });

    // 初期手札・山札の設定（簡易版）
    this.initializeDeck();
    this.dealInitialCards();

    // 公共職場カードの初期化
    // CardDefs の INITIAL_PUBLIC_CARDS を基に、人数によって大工カードを増やす
    // ルール: 2人プレイ -> 大工2枚、3-4人プレイ -> 大工3枚
    const playerCount = this.players.size;
    const carpenterCount = playerCount === 2 ? 2 : 3;

    // 初期公共カード（採石場、鉱山、学校、大工 一枚ずつ）は CardDefs 側で定義済み
    this.publicCards = [...INITIAL_PUBLIC_CARDS];

    // carpentar を探して追加分を複製して publicCards に挿入
    const carpenter = INITIAL_PUBLIC_CARDS.find((c) => c.id === "carpenter");
    if (carpenter) {
      const existingCarpenterCount = this.publicCards.filter((c) =>
        c.id.includes("carpenter")
      ).length;
      const toAdd = Math.max(0, carpenterCount - existingCarpenterCount);
      for (let i = 0; i < toAdd; i++) {
        // id 衝突を避けるためユニーク id を作る
        const clone: Card = {
          ...carpenter,
          id: `${carpenter.id}_pub_${i + 1}`,
        };
        this.publicCards.push(clone);
      }
    }
  }

  /**
   * プレイヤー順をシャッフルして所持金を設定
   */
  private shufflePlayerOrder(): void {
    // プレイヤーを配列に変換してシャッフル
    const playerArray = Array.from(this.players.values());
    const shuffled = playerArray.sort(() => Math.random() - 0.5);

    // 新しいMapを作成（順序を保持）
    const newPlayersMap = new Map<string, Player>();

    // 所持金のルール: 1番手=5, 2番手=6, 3番手=7, 4番手=8
    const startingCoins = [5, 6, 7, 8];

    shuffled.forEach((player, index) => {
      player.coins = startingCoins[index] || 5;
      newPlayersMap.set(player.id, player);
    });

    this.players = newPlayersMap;
  }

  /**
   * 山札の初期化（簡易版）
   */
  private initializeDeck(): void {
    // 初期カード定義（簡易版）
    const initialCards: Card[] = [
      {
        id: "farm-1",
        name: "農場",
        cost: 2,
        effect: "food+1",
        cardType: "building",
      },
      {
        id: "farm-2",
        name: "農場",
        cost: 2,
        effect: "food+1",
        cardType: "building",
      },
      {
        id: "farm-3",
        name: "農場",
        cost: 2,
        effect: "food+1",
        cardType: "building",
      },
      {
        id: "market-1",
        name: "市場",
        cost: 3,
        effect: "coins+2",
        cardType: "building",
      },
      {
        id: "market-2",
        name: "市場",
        cost: 3,
        effect: "coins+2",
        cardType: "building",
      },
      {
        id: "house-1",
        name: "家",
        cost: 1,
        effect: "pop+1",
        cardType: "building",
      },
      {
        id: "house-2",
        name: "家",
        cost: 1,
        effect: "pop+1",
        cardType: "building",
      },
      {
        id: "house-3",
        name: "家",
        cost: 1,
        effect: "pop+1",
        cardType: "building",
      },
      {
        id: "castle-1",
        name: "城",
        cost: 5,
        effect: "vp+3",
        cardType: "building",
      },
      {
        id: "mill-1",
        name: "風車",
        cost: 4,
        effect: "food+2,coins+1",
        cardType: "building",
      },
    ];
    this.deck = [...initialCards].sort(() => Math.random() - 0.5);

    // 消費財デッキの初期化（30枚）
    this.consumableDeck = [...CONSUMABLE_CARDS].sort(() => Math.random() - 0.5);
    this.consumableDiscard = [];
  }

  /**
   * 初期手札の配布
   */
  private dealInitialCards(): void {
    this.players.forEach((player) => {
      player.hand = this.drawCards(3);
    });
  }

  /**
   * 山札からカードを引く
   */
  drawCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.deck.length === 0) {
        // 山札が尽きたら捨て札をシャッフルして山札の下に重ねる
        if (this.discard.length === 0) break;
        const shuffled = [...this.discard].sort(() => Math.random() - 0.5);
        this.deck = [...shuffled, ...this.deck]; // 山札の下に追加
        this.discard = [];
      }
      const card = this.deck.pop();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  /**
   * 消費財カードを引く
   */
  drawGoodsCards(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (this.consumableDeck.length === 0) {
        // 消費財山札が尽きたら捨て札をシャッフルして山札の下に重ねる
        if (this.consumableDiscard.length === 0) break;
        const shuffled = [...this.consumableDiscard].sort(
          () => Math.random() - 0.5
        );
        this.consumableDeck = [...shuffled, ...this.consumableDeck]; // 山札の下に追加
        this.consumableDiscard = [];
      }
      const card = this.consumableDeck.pop();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  /**
   * 次のターンへ進む
   */
  nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.size;
    if (this.currentPlayerIndex === 0) {
      this.round++;
    }
  }

  /**
   * 現在のプレイヤーを取得
   */
  getCurrentPlayer(): Player | undefined {
    const playersArray = Array.from(this.players.values());
    return playersArray[this.currentPlayerIndex];
  }

  /**
   * ゲーム終了判定
   */
  isGameFinished(): boolean {
    return this.round >= this.maxRounds;
  }

  /**
   * プレイヤーがカードを引く
   */
  drawCard(playerId: string): Card[] {
    const player = this.players.get(playerId);
    if (!player) return [];
    const drawn = this.drawCards(1);
    player.hand.push(...drawn);
    return drawn;
  }

  /**
   * プレイヤーがコイン獲得
   */
  gainCoins(playerId: string, amount: number): number {
    const player = this.players.get(playerId);
    if (!player) return 0;
    player.coins += amount;
    return player.coins;
  }

  /**
   * プレイヤーが建物を建設
   */
  buildBuilding(playerId: string, cardId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    const cardIndex = player.hand.findIndex((c) => c.id === cardId);
    if (cardIndex < 0) return false;

    const card = player.hand[cardIndex];
    if (player.coins < card.cost) return false;

    player.hand.splice(cardIndex, 1);
    player.buildings.push(card);
    player.coins -= card.cost;

    return true;
  }

  /**
   * ゲーム状態のスナップショット（ブロードキャスト用）
   */
  toJSON() {
    return {
      roomId: this.roomId,
      players: Array.from(this.players.values()).map((p) => ({
        ...p,
        hand: [], // クライアントには自分の手札だけを送る
      })),
      currentPlayerIndex: this.currentPlayerIndex,
      round: this.round,
      phase: this.phase,
      deckCount: this.deck.length,
      discardCount: this.discard.length,
    };
  }

  /**
   * カード効果を適用（サーバーサイド処理）
   * @deprecated 新しい executeWorkplaceFunction を使用してください
   */
  applyCardEffect(playerId: string, effectId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    // 効果ID に基づいてプレイヤー状態を変更
    switch (effectId) {
      case "resource_gain_1":
      case "food_gain_1":
      case "wood_gain_1":
        // リソース獲得系：現状はコイン換算
        player.coins += 1;
        break;

      case "cost_reduce_1":
        // コスト削減：次のカード建築時にコスト-1
        // TODO: player に cost_modifier フィールドを追加して実装
        break;

      case "score_gain_1":
        player.coins += 1; // 仮実装：コインで得点をシミュレート
        break;

      case "score_gain_2":
        player.coins += 2;
        break;

      case "score_gain_3":
        player.coins += 3;
        break;

      case "coin_gain_2":
        player.coins += 2;
        break;

      case "card_draw_1": {
        const drawn = this.drawCards(1);
        player.hand.push(...drawn);
        break;
      }

      default:
        console.log(`Unknown effect: ${effectId}`);
    }
  }

  /**
   * 職場機能を実行（新しい ALL_CARDS 効果に対応）
   * @param playerId プレイヤーID
   * @param workplaceId 職場カードID
   * @param discardedCardIds 捨てるカードのID配列
   * @returns 実行結果
   */
  executeWorkplaceFunction(
    playerId: string,
    workplaceId: string,
    discardedCardIds: string[] = []
  ): { success: boolean; message: string } {
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, message: "Player not found" };
    }

    // 職場カードを取得（公共または私有）
    const workplace =
      this.deck.find((c) => c.id === workplaceId) ||
      player.buildings.find((c) => c.id === workplaceId);
    if (!workplace) {
      return { success: false, message: "Workplace not found" };
    }

    const effect = workplace.effect;

    try {
      switch (effect) {
        // === 公共職場 ===
        case "draw_card_1": {
          const drawn = this.drawCards(1);
          player.hand.push(...drawn);
          return { success: true, message: `建物カード1枚引きました` };
        }

        case "gain_coins_6_multi": {
          if (discardedCardIds.length < 1) {
            return { success: false, message: "カード1枚を捨ててください" };
          }
          if (this.household < 6) {
            return { success: false, message: "家計に$6以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 1));
          const amount = Math.min(6, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "hire_worker_training": {
          if (player.workers >= 5) {
            return { success: false, message: "労働者が最大です" };
          }
          player.trainingWorkers++;
          return {
            success: true,
            message: "労働者+1（研修中、次ラウンドから）",
          };
        }

        case "build_card": {
          // UIで建築処理を行う（ここではメッセージのみ）
          return { success: true, message: "建物を建ててください" };
        }

        case "gain_coins_6": {
          if (discardedCardIds.length < 1) {
            return { success: false, message: "カード1枚を捨ててください" };
          }
          if (this.household < 6) {
            return { success: false, message: "家計に$6以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 1));
          const amount = Math.min(6, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "gain_coins_12": {
          if (discardedCardIds.length < 2) {
            return { success: false, message: "カード2枚を捨ててください" };
          }
          if (this.household < 12) {
            return { success: false, message: "家計に$12以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 2));
          const amount = Math.min(12, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "hire_to_4_workers": {
          if (player.workers >= 4) {
            return { success: false, message: "労働者が4人以上います" };
          }
          player.workers = 4;
          return { success: true, message: "労働者を4人にしました" };
        }

        case "gain_coins_18": {
          if (discardedCardIds.length < 2) {
            return { success: false, message: "カード2枚を捨ててください" };
          }
          if (this.household < 18) {
            return { success: false, message: "家計に$18以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 2));
          const amount = Math.min(18, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "hire_to_5_workers": {
          if (player.workers >= 5) {
            return { success: false, message: "労働者が5人以上います" };
          }
          player.workers = 5;
          return { success: true, message: "労働者を5人にしました" };
        }

        case "gain_coins_24": {
          if (discardedCardIds.length < 3) {
            return { success: false, message: "カード3枚を捨ててください" };
          }
          if (this.household < 24) {
            return { success: false, message: "家計に$24以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 3));
          const amount = Math.min(24, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "hire_worker_instant": {
          if (player.workers >= 5) {
            return { success: false, message: "労働者が最大です" };
          }
          player.workers++;
          return { success: true, message: "労働者+1（即座に使える）" };
        }

        case "gain_coins_30": {
          if (discardedCardIds.length < 3) {
            return { success: false, message: "カード3枚を捨ててください" };
          }
          if (this.household < 30) {
            return { success: false, message: "家計に$30以上必要です" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 3));
          const amount = Math.min(30, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        // === 私有職場 ===
        case "gain_goods_2_vp_1": {
          const drawn = this.drawGoodsCards(2);
          player.hand.push(...drawn);
          player.victoryTokens++;
          return { success: true, message: "消費財2枚+勝利点トークン1枚" };
        }

        case "draw_card_2_need_mine": {
          // 鉱山に配置チェック（簡易版：スキップ）
          const drawn = this.drawCards(2);
          player.hand.push(...drawn);
          return { success: true, message: "建物カード2枚引きました" };
        }

        case "gain_coins_20_pay_10": {
          if (this.household < 20) {
            return { success: false, message: "家計に$20以上必要です" };
          }
          player.coins += 10;
          this.household -= 10;
          return { success: true, message: "$10獲得（正味）" };
        }

        case "gain_coins_25": {
          if (this.household < 25) {
            return { success: false, message: "家計に$25以上必要です" };
          }
          const amount = Math.min(25, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "gain_goods_hand_size": {
          const handSize = player.hand.length;
          let drawCount = 0;
          if (handSize === 0) drawCount = 3;
          else if (handSize === 1) drawCount = 2;
          else if (handSize === 2) drawCount = 1;
          else {
            return { success: false, message: "手札が3枚以上あります" };
          }
          const drawn = this.drawGoodsCards(drawCount);
          player.hand.push(...drawn);
          return { success: true, message: `消費財${drawCount}枚引きました` };
        }

        case "gain_coins_4_per_good": {
          const goodsCount = player.hand.length; // 簡易版：手札=消費財
          const amount = goodsCount * 4;
          if (this.household < amount) {
            return { success: false, message: `家計に$${amount}以上必要です` };
          }
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "build_facility_draw_2": {
          // UIで施設建築→カード2枚
          return { success: true, message: "施設を建て、カード2枚引く" };
        }

        case "draw_card_2_vp_1": {
          const drawn = this.drawCards(2);
          player.hand.push(...drawn);
          player.victoryTokens++;
          return { success: true, message: "建物カード2枚+勝利点トークン1枚" };
        }

        case "discard_2_draw_4": {
          if (discardedCardIds.length < 2) {
            return { success: false, message: "カード2枚を捨ててください" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 2));
          const drawn = this.drawCards(4);
          player.hand.push(...drawn);
          return { success: true, message: "建物カード4枚引きました" };
        }

        case "draw_goods_4_next_round": {
          // 次ラウンド開始時に追加（TODO: player に pending フィールド追加）
          const drawn = this.drawGoodsCards(4);
          player.hand.push(...drawn);
          return { success: true, message: "消費財4枚（次ラウンド分）" };
        }

        case "build_2_draw_3": {
          // UIで2つ建築→手札空なら3枚
          return { success: true, message: "建物2つ建て、空なら3枚引く" };
        }

        case "draw_card_4": {
          const drawn = this.drawCards(4);
          player.hand.push(...drawn);
          return { success: true, message: "建物カード4枚引きました" };
        }

        case "none":
          return { success: true, message: "特殊効果なし" };

        case "build_card_vp_1": {
          // UIで建築→勝利点+1
          return { success: true, message: "建物を建て、勝利点トークン1枚" };
        }

        case "discard_3_draw_6": {
          if (discardedCardIds.length < 3) {
            return { success: false, message: "カード3枚を捨ててください" };
          }
          this.discardCards(player, discardedCardIds.slice(0, 3));
          const drawn = this.drawCards(6);
          player.hand.push(...drawn);
          return { success: true, message: "建物カード6枚引きました" };
        }

        case "draw_card_3": {
          const drawn = this.drawCards(3);
          player.hand.push(...drawn);
          return { success: true, message: "建物カード3枚引きました" };
        }

        case "gain_coins_8": {
          if (this.household < 8) {
            return { success: false, message: "家計に$8以上必要です" };
          }
          const amount = Math.min(8, this.household);
          player.coins += amount;
          this.household -= amount;
          return { success: true, message: `$${amount}獲得` };
        }

        case "build_free_under_10": {
          // UIで資産価値$10以下の建物を無料建築
          return { success: true, message: "$10以下の建物を無料で建てる" };
        }

        case "gain_goods_2or3": {
          const hasGoods = player.hand.length > 0;
          const drawCount = hasGoods ? 3 : 2;
          const drawn = this.drawCards(drawCount);
          player.hand.push(...drawn);
          return { success: true, message: `消費財${drawCount}枚引きました` };
        }

        // === パッシブ効果（終了時ボーナス） ===
        case "passive_double_vp":
        case "passive":
          return { success: true, message: "パッシブ効果（終了時計算）" };

        default:
          return { success: false, message: `未実装の効果: ${effect}` };
      }
    } catch (error) {
      return { success: false, message: `エラー: ${error}` };
    }
  }

  /**
   * カードを捨てる
   */
  private discardCards(player: Player, cardIds: string[]): void {
    cardIds.forEach((id) => {
      const index = player.hand.findIndex((c) => c.id === id);
      if (index >= 0) {
        const card = player.hand.splice(index, 1)[0];
        this.discard.push(card);
      }
    });
  }

  /**
   * ワーカーを職場に配置
   * @param playerId プレイヤーID
   * @param workplaceId 職場ID
   * @returns 配置成功の可否
   */
  placeWorker(playerId: string, workplaceId: string): boolean {
    const player = this.players.get(playerId);
    if (!player || player.workers <= 0) return false;

    if (!this.placedWorkers.has(playerId)) {
      this.placedWorkers.set(playerId, new Map());
    }

    const playerPlaced = this.placedWorkers.get(playerId)!;
    const currentCount = playerPlaced.get(workplaceId) || 0;

    // 複数配置可能な職場（コスト削減効果あり）
    playerPlaced.set(workplaceId, currentCount + 1);
    player.workers--;

    return true;
  }

  /**
   * プレイヤーがラウンドをパス
   * @param playerId プレイヤーID
   */
  passRound(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    // ラウンド中は行動終了（将来的には行動順序の管理に使用）
    console.log(`${player.name} passed this round`);
  }

  /**
   * ラウンド終了処理
   * 1. 労働者をプレイヤーに戻す
   * 2. 賃金支払い
   * 3. 次のラウンドへ
   */
  endRound(): { success: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. 労働者を戻す & 賃金支払い
    this.players.forEach((player) => {
      const totalWorkers = player.workers + (player.trainingWorkers || 0);
      player.workers = Math.min(
        totalWorkers + this.getTotalPlacedWorkers(player.id),
        GAME_CONFIG.MAX_WORKERS
      );

      // 賃金計算
      const wage = player.workers * this.currentRoundCard.wagePerWorker;
      const paymentResult = this.payWages(player.id, wage);

      if (!paymentResult.success) {
        errors.push(`${player.name}: ${paymentResult.message}`);
      }
    });

    // 2. ワーカー配置情報をリセット
    this.placedWorkers.clear();
    this.players.forEach((player) => {
      this.placedWorkers.set(player.id, new Map());
    });

    // 3. 次のラウンドへ
    this.round++;
    if (this.round <= GAME_CONFIG.TOTAL_ROUNDS) {
      this.currentRoundCard = ROUND_CARDS[this.round - 1];
    } else {
      this.phase = "finished";
    }

    return { success: errors.length === 0, errors };
  }

  /**
   * プレイヤーの配置労働者総数を取得
   */
  private getTotalPlacedWorkers(playerId: string): number {
    const placed = this.placedWorkers.get(playerId);
    if (!placed) return 0;

    let total = 0;
    placed.forEach((count) => {
      total += count;
    });
    return total;
  }

  /**
   * 賃金支払い処理
   * @param playerId プレイヤーID
   * @param wageAmount 支払い賃金
   * @returns 支払い結果
   */
  payWages(
    playerId: string,
    wageAmount: number
  ): { success: boolean; paid: number; debt: number; message: string } {
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, paid: 0, debt: 0, message: "Player not found" };
    }

    if (player.coins >= wageAmount) {
      // 賃金支払い可能
      player.coins -= wageAmount;
      this.household += wageAmount;
      return {
        success: true,
        paid: wageAmount,
        debt: 0,
        message: "Payment successful",
      };
    }

    // 所持金不足 → 建物売却が必要
    const deficit = wageAmount - player.coins;
    let sellValue = 0;

    // 自動売却処理（簡易版：最初の建物から売却）
    while (sellValue < deficit && player.buildings.length > 0) {
      const building = player.buildings.shift()!;
      const value = building.assetValue || 0;
      sellValue += value;
    }

    // 支払い可能額を計算
    const availableFunds = player.coins + sellValue;
    const paidAmount = Math.min(availableFunds, wageAmount);

    player.coins = 0;
    this.household += paidAmount;

    // 未払い賃金を記録
    const unpaidAmount = wageAmount - paidAmount;
    if (unpaidAmount > 0) {
      player.unpaidDebt += Math.ceil(unpaidAmount / 1); // $1 = 1枚
      return {
        success: false,
        paid: paidAmount,
        debt: player.unpaidDebt,
        message: `Insufficient funds. Debt: ${player.unpaidDebt} cards`,
      };
    }

    return {
      success: true,
      paid: paidAmount,
      debt: 0,
      message: "Payment successful with building sales",
    };
  }

  /**
   * 建物売却処理
   * @param playerId プレイヤーID
   * @param buildingId 建物ID
   * @returns 売却成功の可否
   */
  sellBuilding(playerId: string, buildingId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    const buildingIndex = player.buildings.findIndex(
      (b) => b.id === buildingId
    );
    if (buildingIndex < 0) return false;

    const building = player.buildings[buildingIndex];
    const saleValue = building.assetValue || 0;

    player.buildings.splice(buildingIndex, 1);
    player.coins += Math.min(saleValue, this.supply);

    this.supply -= saleValue;

    return true;
  }

  /**
   * 終了時ボーナスを計算
   * @param player プレイヤー
   * @returns ボーナス得点
   */
  private calculateEndGameBonus(player: Player): number {
    let bonus = 0;

    player.buildings.forEach((building) => {
      if (!building.endGameBonus) return;

      switch (building.endGameBonus) {
        case "double_victory_tokens": {
          // 会計事務所：勝利点トークンから2倍の得点
          const fullSets = Math.floor(player.victoryTokens / 3);
          const remaining = player.victoryTokens % 3;
          const normalScore = fullSets * 10 + remaining;
          bonus += normalScore; // 通常スコアと合わせて2倍
          break;
        }

        case "8_if_no_facility": {
          // 墓地：施設建物を持っていなければ+8点
          const hasFacility = player.buildings.some(
            (b) => b.category === "private" && b.name.includes("施設")
          );
          if (!hasFacility) {
            bonus += 8;
          }
          break;
        }

        case "24_if_6_plus_buildings": {
          // 輸出港：建物6つ以上で+24点
          if (player.buildings.length >= 6) {
            bonus += 24;
          }
          break;
        }

        case "18_if_8_plus_buildings": {
          // 鉄道駅：建物8つ以上で+18点（鉄道駅自体も含む）
          if (player.buildings.length >= 8) {
            bonus += 18;
          }
          break;
        }

        case "30_if_4_plus_facilities": {
          // 投資銀行：施設建物4つ以上で+30点（投資銀行自体も含む）
          const facilityCount = player.buildings.filter(
            (b) => b.category === "private" && b.name.includes("施設")
          ).length;
          if (facilityCount >= 4) {
            bonus += 30;
          }
          break;
        }

        case "22_if_4_plus_agriculture": {
          // 植物園：農業建物4つ以上で+22点
          const agricultureCount = player.buildings.filter(
            (b) => b.category === "private" && b.name.includes("農")
          ).length;
          if (agricultureCount >= 4) {
            bonus += 22;
          }
          break;
        }
      }
    });

    return bonus;
  }

  /**
   * 最終スコア計算
   * @param playerId プレイヤーID
   * @returns スコア内訳
   */
  calculateFinalScore(playerId: string): ScoreBreakdown {
    const player = this.players.get(playerId);
    if (!player) {
      return {
        buildings: 0,
        endGameBonus: 0,
        coins: 0,
        victoryTokens: 0,
        unpaidDebtPenalty: 0,
        total: 0,
      };
    }

    let score = 0;
    const breakdown: ScoreBreakdown = {
      buildings: 0,
      endGameBonus: 0,
      coins: 0,
      victoryTokens: 0,
      unpaidDebtPenalty: 0,
      total: 0,
    };

    // 1. 建物の資産価値
    breakdown.buildings = player.buildings.reduce(
      (sum, b) => sum + (b.assetValue || 0),
      0
    );
    score += breakdown.buildings;

    // 2. 建物の終了時ボーナス
    breakdown.endGameBonus = this.calculateEndGameBonus(player);
    score += breakdown.endGameBonus;

    // 3. 所持金
    breakdown.coins = player.coins;
    score += player.coins;

    // 4. 勝利点トークン（3枚 = 10点）
    const fullSets = Math.floor(player.victoryTokens / 3);
    const remaining = player.victoryTokens % 3;
    breakdown.victoryTokens = fullSets * 10 + remaining;
    score += breakdown.victoryTokens;

    // 5. 未払い賃金ペナルティ（-3点/枚）
    breakdown.unpaidDebtPenalty =
      -player.unpaidDebt * GAME_CONFIG.UNPAID_DEBT_PENALTY;
    score += breakdown.unpaidDebtPenalty;

    breakdown.total = score;
    return breakdown;
  }

  /**
   * ゲーム結果を集計
   * @returns ゲーム終了結果（順位・スコア）
   */
  calculateGameResults(): GameResults {
    const scores = Array.from(this.players.keys()).map((id) => ({
      playerId: id,
      name: this.players.get(id)!.name,
      score: this.calculateFinalScore(id).total,
      breakdown: this.calculateFinalScore(id),
    }));

    scores.sort((a, b) => b.score - a.score);

    return {
      ranking: scores,
      winner: scores[0].playerId,
    };
  }
}
