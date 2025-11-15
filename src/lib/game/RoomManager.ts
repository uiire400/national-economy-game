/**
 * RoomManager.ts
 * ルーム管理とWebSocket接続管理
 */

import { WebSocket } from "ws";
import { GameState } from "./GameState";

export interface ClientConnection {
  ws: WebSocket;
  playerId: string;
  roomId: string;
  lastHeartbeat: number;
}

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, GameState> = new Map();
  private connections: Map<WebSocket, ClientConnection> = new Map();
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startHeartbeat();
  }

  static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  /**
   * ルーム一覧を取得
   */
  getRooms(): GameState[] {
    return Array.from(this.rooms.values()).filter((room) => {
      // ロビー状態のルームのみ表示
      return room.phase === "lobby" && room.players.size < 4;
    });
  }

  /**
   * ルームを作成
   */
  createRoom(): GameState {
    const roomId = this.generateRoomId();
    const gameState = new GameState(roomId);
    this.rooms.set(roomId, gameState);
    console.log(`[RoomManager] Room created: ${roomId}`);
    return gameState;
  }

  /**
   * 指定されたroomIdでルームを作成
   */
  createRoomWithId(roomId: string): GameState {
    const gameState = new GameState(roomId);
    this.rooms.set(roomId, gameState);
    console.log(`[RoomManager] Room created with ID: ${roomId}`);
    return gameState;
  }

  /**
   * ルームを取得
   */
  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * クライアント接続を登録
   */
  registerConnection(ws: WebSocket, playerId: string, roomId: string): void {
    this.connections.set(ws, {
      ws,
      playerId,
      roomId,
      lastHeartbeat: Date.now(),
    });
  }

  /**
   * クライアント接続を解除
   */
  unregisterConnection(ws: WebSocket): void {
    this.connections.delete(ws);
  }

  /**
   * 特定のルームのすべてのクライアントにメッセージを送信
   */
  broadcastToRoom(roomId: string, message: Record<string, unknown>): void {
    this.connections.forEach((conn, ws) => {
      if (conn.roomId === roomId && ws.readyState === 1) {
        // 1 = OPEN
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(
            `[RoomManager] Failed to send message to ${conn.playerId}:`,
            error
          );
        }
      }
    });
  }

  /**
   * 特定のクライアントにメッセージを送信
   */
  sendToPlayer(
    roomId: string,
    playerId: string,
    message: Record<string, unknown>
  ): void {
    this.connections.forEach((conn, ws) => {
      if (
        conn.roomId === roomId &&
        conn.playerId === playerId &&
        ws.readyState === 1
      ) {
        try {
          ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(
            `[RoomManager] Failed to send message to ${playerId}:`,
            error
          );
        }
      }
    });
  }

  /**
   * Heartbeat: 5秒ごとに ping を送信（Vercel Sleep対策）
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((conn, ws) => {
        if (ws.readyState === 1) {
          // 1 = OPEN
          try {
            ws.send(
              JSON.stringify({
                type: "ping",
                payload: {},
                timestamp: Date.now(),
              })
            );
          } catch (error) {
            console.error(
              `[RoomManager] Heartbeat failed for ${conn.playerId}:`,
              error
            );
          }
        }
      });
    }, 5000); // 5秒ごと
  }

  /**
   * Heartbeat 停止
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 空のルームを削除
   */
  cleanupEmptyRooms(): void {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    this.rooms.forEach((room, roomId) => {
      // プレイヤーが0人で10分以上経過したルームを削除
      if (room.players.size === 0 && now - room.createdAt > 10 * 60 * 1000) {
        roomsToDelete.push(roomId);
      }
    });

    roomsToDelete.forEach((roomId) => {
      this.rooms.delete(roomId);
      console.log(`[RoomManager] Room deleted: ${roomId}`);
    });
  }

  /**
   * ルームID生成（6文字のランダム文字列）
   */
  private generateRoomId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 統計情報
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalConnections: this.connections.size,
      rooms: Array.from(this.rooms.values()).map((room) => ({
        roomId: room.roomId,
        playerCount: room.players.size,
        phase: room.phase,
      })),
    };
  }
}
