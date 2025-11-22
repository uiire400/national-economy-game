/**
 * types.ts
 * ゲーム全体の型定義
 */

export interface Card {
  id: string;
  name: string;
  cost: number;
  effect: string;
  cardType?: "building" | "goods"; // カードタイプ（オプショナル）
  assetValue?: number; // 建物の資産価値（得点）
  category?: "public" | "private";
  buildingTag?: "agriculture" | "industry" | "key"; // 建物タグ（【農業】【工業】【鍵】）
  cannotSell?: boolean; // 売却不可フラグ（【鍵】建物）
  endGameBonus?: string; // 終了時ボーナスID
  icon?: string; // 絵文字
  allowMultipleWorkers?: boolean; // 複数労働者配置可能か（鉱山・店系カード）
}

export interface Player {
  id: string;
  name: string;
  ready: boolean;
  coins: number;
  food: number;
  population: number;
  hand: Card[];
  buildings: Card[];
  workers: number; // 現在の労働者数（2～5）
  trainingWorkers: number; // 研修中（翌ラウンドで使用可）
  unpaidDebt: number; // 未払い賃金カード枚数
  victoryTokens: number; // 勝利点トークン
}

export interface RoundCard {
  round: number;
  wagePerWorker: number;
  newPublicBuildingIds?: string[];
}

export interface ScoreBreakdown {
  buildings: number;
  endGameBonus: number;
  coins: number;
  victoryTokens: number;
  unpaidDebtPenalty: number;
  total: number;
}

export interface GameResults {
  ranking: Array<{
    playerId: string;
    name: string;
    score: number;
    breakdown: ScoreBreakdown;
  }>;
  winner: string;
}

export interface GameMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface JoinMessage extends GameMessage {
  type: "join";
  payload: {
    playerId: string;
    playerName: string;
  };
}

export interface ReadyMessage extends GameMessage {
  type: "ready";
  payload: {
    playerId: string;
  };
}

export interface ActionMessage extends GameMessage {
  type: "action";
  payload: {
    playerId: string;
    actionType: string;
    data: Record<string, unknown>;
  };
}

export interface PingMessage extends GameMessage {
  type: "ping";
  payload: Record<string, never>;
}

export interface PongMessage extends GameMessage {
  type: "pong";
  payload: Record<string, never>;
}

export interface BroadcastMessage extends GameMessage {
  type: "broadcast";
  payload: {
    event: string;
    data: Record<string, unknown>;
  };
}

export type WebSocketMessage =
  | JoinMessage
  | ReadyMessage
  | ActionMessage
  | PingMessage
  | PongMessage
  | BroadcastMessage;
