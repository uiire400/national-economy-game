import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { RoomManager } from "./src/lib/game/RoomManager";
import { GameState } from "./src/lib/game/GameState";
import type {
  WebSocketMessage,
  ReadyMessage,
  ActionMessage,
  PongMessage,
} from "./src/lib/types";

const PORT = process.env.WS_PORT || 3001;
const roomManager = RoomManager.getInstance();

const server = createServer();
const wss = new WebSocketServer({ server });

/**
 * WebSocket 接続ハンドラー
 */
wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const roomId = url.searchParams.get("roomId") || "";
  const playerId = url.searchParams.get("playerId") || "";
  const playerName = url.searchParams.get("playerName") || "Anonymous";

  console.log(
    `[WebSocket] New connection: roomId=${roomId}, playerId=${playerId}, playerName=${playerName}`
  );

  if (!roomId || !playerId) {
    ws.close(1008, "Missing roomId or playerId");
    return;
  }

  // ルームを取得または作成
  let room = roomManager.getRoom(roomId);
  if (!room) {
    room = roomManager.createRoomWithId(roomId);
  }

  // プレイヤーを追加
  room.addPlayer(playerId, playerName);
  roomManager.registerConnection(ws, playerId, roomId);

  // 人数制限チェック（4人まで）
  if (room.players.size > 4) {
    ws.send(
      JSON.stringify({
        type: "room_full",
        payload: {
          message: "ルームが満員です（最大4人）",
        },
        timestamp: Date.now(),
      })
    );
    ws.close(1008, "Room is full");
    room.removePlayer(playerId);
    roomManager.unregisterConnection(ws);
    return;
  }

  // ブロードキャスト: プレイヤーが参加した
  roomManager.broadcastToRoom(roomId, {
    type: "player_joined",
    payload: {
      playerId,
      playerName,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
      })),
      playerCount: room.players.size,
      minPlayers: 2,
      maxPlayers: 4,
    },
    timestamp: Date.now(),
  });

  /**
   * メッセージ受信
   */
  ws.on("message", (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "pong":
          handlePong(ws, message as PongMessage);
          break;

        case "ready":
          handleReady(ws, message as ReadyMessage, room!, roomManager);
          break;

        case "action":
          handleAction(ws, message as ActionMessage, room!, roomManager);
          break;

        default:
          console.warn(`[WebSocket] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("[WebSocket] Failed to parse message:", error);
    }
  });

  /**
   * 接続切断
   */
  ws.on("close", () => {
    console.log(`[WebSocket] Connection closed: playerId=${playerId}`);
    if (room) {
      room.removePlayer(playerId);
      roomManager.unregisterConnection(ws);

      // ブロードキャスト: プレイヤーが退出した
      if (room.players.size > 0) {
        roomManager.broadcastToRoom(roomId, {
          type: "player_left",
          payload: {
            playerId,
            playerName,
            players: Array.from(room.players.values()).map((p) => ({
              id: p.id,
              name: p.name,
              ready: p.ready,
            })),
          },
          timestamp: Date.now(),
        });
      }
    }
  });

  /**
   * エラーハンドリング
   */
  ws.on("error", (error: Error) => {
    console.error(`[WebSocket] Error for playerId=${playerId}:`, error);
  });
});

/**
 * pong メッセージハンドラー
 */
function handlePong(_ws: WebSocket, message: PongMessage): void {
  console.log(
    `[WebSocket] Pong received at ${new Date(message.timestamp).toISOString()}`
  );
}

/**
 * ready メッセージハンドラー
 */
function handleReady(
  _ws: WebSocket,
  message: ReadyMessage,
  room: GameState,
  roomManager: RoomManager
): void {
  const playerId = message.payload.playerId;
  const player = room.players.get(playerId);

  if (!player) {
    console.warn(`[WebSocket] Player not found: ${playerId}`);
    return;
  }

  player.ready = true;
  console.log(`[WebSocket] Player ready: ${playerId}`);

  // ブロードキャスト: プレイヤーが ready した
  roomManager.broadcastToRoom(room.roomId, {
    type: "player_ready",
    payload: {
      playerId,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        ready: p.ready,
      })),
      playerCount: room.players.size,
      canStart:
        room.isAllReady() && room.players.size >= 2 && room.players.size <= 4,
    },
    timestamp: Date.now(),
  });

  // 全員が ready で、2-4人なら、並び順ルーレット → ゲーム開始
  if (room.isAllReady() && room.players.size >= 2 && room.players.size <= 4) {
    console.log(
      `[WebSocket] All ${room.players.size} players ready, shuffling order: ${room.roomId}`
    );

    // 並び順ルーレット実施（ゲーム初期化内でシャッフル）
    room.initializeGame();

    // シャッフル後のプレイヤー順を取得
    const playersAfter = Array.from(room.players.values()).map((p, index) => ({
      id: p.id,
      name: p.name,
      order: index + 1,
      coins: p.coins,
    }));

    // 並び順ルーレット結果をブロードキャスト
    roomManager.broadcastToRoom(room.roomId, {
      type: "player_order_decided",
      payload: {
        players: playersAfter,
      },
      timestamp: Date.now(),
    });

    // 少し待ってからゲーム開始を通知
    setTimeout(() => {
      // 各プレイヤーに個別に手札を送信
      room.players.forEach((player) => {
        roomManager.sendToPlayer(room.roomId, player.id, {
          type: "hand_updated",
          payload: {
            hand: player.hand,
          },
          timestamp: Date.now(),
        });
      });

      // 全員にゲーム開始を通知
      roomManager.broadcastToRoom(room.roomId, {
        type: "game_started",
        payload: {
          gameState: room.toJSON(),
          currentPlayer: room.getCurrentPlayer(),
        },
        timestamp: Date.now(),
      });
    }, 3000); // 3秒待つ
  }
}

/**
 * action メッセージハンドラー
 */
function handleAction(
  _ws: WebSocket,
  message: ActionMessage,
  room: GameState,
  roomManager: RoomManager
): void {
  const { playerId, actionType, data } = message.payload;

  console.log(`[WebSocket] Action from ${playerId}: ${actionType}`, data);

  switch (actionType) {
    case "draw_card": {
      const player = room.players.get(playerId);
      if (player) {
        const drawn = room.drawCard(playerId);

        // プレイヤーに個別に手札を通知
        roomManager.sendToPlayer(room.roomId, playerId, {
          type: "hand_updated",
          payload: {
            hand: player.hand,
          },
          timestamp: Date.now(),
        });

        // 全員に状態を更新
        roomManager.broadcastToRoom(room.roomId, {
          type: "action_executed",
          payload: {
            playerId,
            action: "draw_card",
            cardCount: drawn.length,
            gameState: room.toJSON(),
          },
          timestamp: Date.now(),
        });
      }
      break;
    }

    case "gain_coins": {
      const amount = (data as { amount?: number }).amount || 5;
      const player = room.players.get(playerId);
      if (player) {
        const newCoins = room.gainCoins(playerId, amount);

        roomManager.broadcastToRoom(room.roomId, {
          type: "resource_updated",
          payload: {
            playerId,
            coins: newCoins,
            gameState: room.toJSON(),
          },
          timestamp: Date.now(),
        });
      }
      break;
    }

    case "build_card": {
      const cardId = (data as { cardId?: string }).cardId;
      if (!cardId) break;

      const player = room.players.get(playerId);
      if (player && room.buildBuilding(playerId, cardId)) {
        // プレイヤーに個別に手札を通知
        roomManager.sendToPlayer(room.roomId, playerId, {
          type: "hand_updated",
          payload: {
            hand: player.hand,
          },
          timestamp: Date.now(),
        });

        // 全員に建設を通知
        roomManager.broadcastToRoom(room.roomId, {
          type: "building_built",
          payload: {
            playerId,
            card: player.buildings[player.buildings.length - 1],
            gameState: room.toJSON(),
          },
          timestamp: Date.now(),
        });
      }
      break;
    }

    case "next_turn": {
      room.nextTurn();

      roomManager.broadcastToRoom(room.roomId, {
        type: "turn_changed",
        payload: {
          currentPlayer: room.getCurrentPlayer(),
          round: room.round,
          gameState: room.toJSON(),
        },
        timestamp: Date.now(),
      });
      break;
    }

    default:
      console.warn(`[WebSocket] Unknown action type: ${actionType}`);
  }
}

/**
 * 定期メンテナンス: 空ルーム削除
 */
setInterval(() => {
  roomManager.cleanupEmptyRooms();
}, 30000); // 30秒ごと

/**
 * サーバー起動
 */
server.listen(PORT, () => {
  console.log(`[Server] WebSocket server listening on ws://localhost:${PORT}`);
  console.log(`[Stats] ${JSON.stringify(roomManager.getStats())}`);
});

/**
 * グレースフルシャットダウン
 */
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received, shutting down...");
  roomManager.stopHeartbeat();
  server.close(() => {
    console.log("[Server] Server closed");
    process.exit(0);
  });
});
