"use client";

import { useEffect, useState, useRef } from "react";
import type { Player, Card, GameResults } from "@/lib/types";
import { INITIAL_PUBLIC_CARDS, ROUND_CARDS } from "@/lib/game/CardDefs";
import WagePaymentModal from "./WagePaymentModal";
import HandAdjustmentModal from "./HandAdjustmentModal";
import FinalScoreModal from "./FinalScoreModal";
import BuildCardModal from "./BuildCardModal";
import DiscardOnlyModal from "./DiscardOnlyModal";
import CardImage from "./CardImage";

interface GameRoomProps {
  roomId: string;
}

// ゲームボード風UIスタイル
const styles = {
  // コンテナ
  gameBoard: {
    minHeight: "100vh",
    backgroundColor: "#2d5016",
    padding: "8px",
    fontFamily: "Arial, sans-serif",
    overflowX: "hidden" as const,
    color: "#333",
  },

  // 上部ステータスバー
  statusBar: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "4px",
    marginBottom: "4px",
    backgroundColor: "#fff",
    padding: "4px",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },

  statusBarSecond: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "4px",
    marginBottom: "6px",
    backgroundColor: "#fff",
    padding: "4px",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },

  statusBox: {
    padding: "4px",
    borderRadius: "3px",
    textAlign: "center" as const,
    fontSize: "11px",
    fontWeight: "bold",
    border: "1px solid #333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },

  statusBoxRound: {
    backgroundColor: "#ffa500",
    borderColor: "#ff8c00",
    color: "#fff",
  },

  statusBoxWorker: {
    backgroundColor: "#4169e1",
    borderColor: "#1e40af",
    color: "#fff",
  },

  statusBoxCoin: {
    backgroundColor: "#228b22",
    borderColor: "#006600",
    color: "#fff",
  },

  statusBoxScore: {
    backgroundColor: "#000",
    borderColor: "#333",
    color: "#fff",
  },

  statusBoxLoan: {
    backgroundColor: "#dc143c",
    borderColor: "#8b0000",
    color: "#fff",
  },

  statusLabel: {
    fontSize: "9px",
    opacity: 0.9,
  },

  statusValue: {
    fontSize: "13px",
  },

  // 共有カードエリア (テーブル中央)
  publicCardsSection: {
    backgroundColor: "#fff",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    border: "2px solid #8b4513",
  },

  publicCardsTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "6px",
    color: "#333",
    textAlign: "center" as const,
  },

  roundCardDisplay: {
    backgroundColor: "#ffa500",
    padding: "4px",
    borderRadius: "4px",
    marginBottom: "6px",
    textAlign: "center" as const,
    fontWeight: "bold",
    color: "#fff",
    fontSize: "11px",
    border: "1px solid #ff8c00",
  },

  publicCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
    gap: "6px",
  },

  cardSlot: {
    aspectRatio: "1 / 1",
    border: "2px solid #999",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    textAlign: "center" as const,
    padding: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative" as const,
    minWidth: "60px",
    maxWidth: "120px",
  },

  cardSlotHover: {
    boxShadow: "0 0 8px rgba(255,255,0,0.5)",
    transform: "scale(1.02)",
  },

  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: "2px",
    objectFit: "cover" as const,
  },

  cardName: {
    position: "absolute" as const,
    bottom: "2px",
    left: "2px",
    right: "2px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    fontSize: "9px",
    padding: "2px",
    borderRadius: "2px",
  },

  cardCost: {
    position: "absolute" as const,
    topRight: "2px",
    right: "2px",
    backgroundColor: "#ffd700",
    color: "#000",
    fontSize: "10px",
    fontWeight: "bold",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // プレイヤーエリア
  playerSection: {
    backgroundColor: "#fff",
    padding: "4px 6px",
    borderRadius: "4px",
    marginBottom: "6px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },

  playerTitle: {
    fontSize: "10px",
    fontWeight: "600",
    marginBottom: "4px",
    color: "#333",
  },

  playersList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "4px",
    marginBottom: "4px",
  },

  playerCard: {
    padding: "4px 6px",
    backgroundColor: "#f9f9f9",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ddd",
    borderRadius: "4px",
    fontSize: "10px",
    textAlign: "center" as const,
  },

  playerCardActive: {
    backgroundColor: "#fffacd",
    borderColor: "#ffd700",
  },

  playerCardSelf: {
    borderColor: "#228b22",
    backgroundColor: "#f0fff0",
  },

  playerName: {
    fontWeight: "600",
    fontSize: "10px",
  },

  playerStats: {
    fontSize: "9px",
    color: "#666",
  },

  // 手札エリア
  handSection: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  handTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },

  handGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
    gap: "6px",
  },

  handCard: {
    aspectRatio: "1 / 1",
    border: "2px solid #3498db",
    borderRadius: "4px",
    backgroundColor: "#e8f4f8",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    textAlign: "center" as const,
    padding: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#333",
    minWidth: "60px",
    maxWidth: "120px",
  },

  handCardHover: {
    backgroundColor: "#3498db",
    color: "#fff",
    transform: "scale(1.05)",
    boxShadow: "0 0 8px rgba(52,152,219,0.5)",
  },

  // アクションボタン
  actionSection: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  actionButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  actionButton: {
    padding: "12px",
    fontSize: "13px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#fff",
  },

  actionButtonActive: {
    backgroundColor: "#2ecc71",
  },

  actionButtonDisabled: {
    backgroundColor: "#95a5a6",
    opacity: 0.6,
    cursor: "not-allowed",
  },

  // プレイヤーの建築済みカードエリア
  builtCardsSection: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  builtCardsTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },

  builtCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
    gap: "6px",
  },

  builtCard: {
    aspectRatio: "1 / 1",
    border: "2px solid #228b22",
    borderRadius: "4px",
    backgroundColor: "#f0fff0",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    textAlign: "center" as const,
    padding: "4px",
    transition: "all 0.2s",
    minWidth: "60px",
    maxWidth: "120px",
  },

  // ガイドメッセージ
  guideMessageSection: {
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    padding: "6px 8px",
    borderRadius: "4px",
    marginBottom: "6px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    textAlign: "center" as const,
  },

  guideMessageText: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#856404",
    lineHeight: "1.3",
  },

  // ゲームログ
  logSection: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },

  logTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },

  gameLog: {
    maxHeight: "120px",
    overflowY: "auto" as const,
    backgroundColor: "#f9f9f9",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontFamily: "monospace",
    lineHeight: "1.3",
  },

  logEntry: {
    padding: "2px 0",
    borderBottom: "1px solid #eee",
  },
};

export default function GameRoom({ roomId }: GameRoomProps) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<string>("lobby");
  const [round, setRound] = useState<number>(1);
  const [wagePerWorker] = useState<number>(2);
  const [myCoins, setMyCoins] = useState<number>(5);
  const [myWorkers, setMyWorkers] = useState<number>(2); // 残り労働者数
  const [totalWorkers, setTotalWorkers] = useState<number>(2); // 総労働者数
  const [unpaidDebt] = useState<number>(0);
  const [victoryTokens] = useState<number>(0);
  const [household, setHousehold] = useState<number>(0);
  const [publicCards] = useState<Card[]>(INITIAL_PUBLIC_CARDS);
  const [currentRoundCard] = useState(ROUND_CARDS[0]);

  // モーダル状態
  const [showWageModal, setShowWageModal] = useState<boolean>(false);
  const [showHandModal, setShowHandModal] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [showBuildModal, setShowBuildModal] = useState<boolean>(false);
  const [showDiscardModal, setShowDiscardModal] = useState<boolean>(false);
  const [discardModalConfig, setDiscardModalConfig] = useState<{
    requiredCount: number;
    title: string;
    workplaceId: string;
  } | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [myBuildings, setMyBuildings] = useState<Card[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [showPlayerOrder, setShowPlayerOrder] = useState<boolean>(false);
  const [playerOrder, setPlayerOrder] = useState<
    Array<{ id: string; name: string; order: number; coins: number }>
  >([]);
  const [guideMessage, setGuideMessage] = useState<string>("");
  const [placedWorkers, setPlacedWorkers] = useState<
    Map<string, Map<string, number>>
  >(new Map());

  // ダブルタップ検出用（タップ対象カードIDと時刻）
  const lastTapRef = useRef<{ id?: string; time: number }>({
    id: undefined,
    time: 0,
  });

  const addLog = (message: string) => {
    setGameLog((prev: string[]) => [...prev, message].slice(-15));
  };

  useEffect(() => {
    // URLパラメータからニックネームを取得
    const params = new URLSearchParams(window.location.search);
    const urlNickname =
      params.get("nickname") ||
      `Player_${Math.random().toString(36).substr(2, 5)}`;

    const newPlayerId = `player_${Math.random().toString(36).substr(2, 9)}`;

    setPlayerId(newPlayerId);

    const websocket = new WebSocket(
      `ws://localhost:3001/?roomId=${roomId}&playerId=${newPlayerId}&playerName=${encodeURIComponent(urlNickname)}`
    );

    websocket.onopen = () => {
      addLog(`✅ 接続成功`);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "ping":
          websocket.send(
            JSON.stringify({
              type: "pong",
              payload: {},
              timestamp: Date.now(),
            })
          );
          break;

        case "player_joined": {
          const payload = message.payload as {
            players: Player[];
            playerCount: number;
            minPlayers: number;
            maxPlayers: number;
          };
          setPlayers(payload.players);
          setPlayerCount(payload.playerCount);
          addLog(`👤 入室 (${payload.playerCount}/${payload.maxPlayers}人)`);
          break;
        }

        case "player_left": {
          const payload = message.payload as { players: Player[] };
          setPlayers(payload.players);
          setPlayerCount(payload.players.length);
          addLog(`👤 退室`);
          break;
        }

        case "player_ready": {
          const payload = message.payload as {
            players: Player[];
            playerCount: number;
            canStart: boolean;
          };
          setPlayers(payload.players);
          setPlayerCount(payload.playerCount);
          // canStart は表示に利用（全員準備完了のメッセージ表示用）
          addLog(`🔔 準備完了`);
          break;
        }

        case "room_full": {
          const payload = message.payload as { message: string };
          addLog(`❌ ${payload.message}`);
          alert(payload.message);
          break;
        }

        case "player_order_decided": {
          const payload = message.payload as {
            players: Array<{
              id: string;
              name: string;
              order: number;
              coins: number;
            }>;
          };
          setPlayerOrder(payload.players);
          setShowPlayerOrder(true);
          addLog(`🎲 並び順決定！`);

          // 自分の所持金を更新
          const myOrderData = payload.players.find((p) => p.id === newPlayerId);
          if (myOrderData) {
            setMyCoins(myOrderData.coins);
          }

          // 3秒後に自動で閉じる
          setTimeout(() => {
            setShowPlayerOrder(false);
          }, 3000);
          break;
        }

        case "game_started": {
          setGamePhase("ingame");
          setShowPlayerOrder(false);
          addLog(`🎮 ゲーム開始！`);
          const payload = message.payload as {
            currentPlayer: Player;
            gameState: {
              players: Player[];
              round: number;
              household?: number;
              supply?: number;
            };
          };
          setCurrentPlayer(payload.currentPlayer);

          // プレイヤー情報を更新（所持金を含む）
          if (payload.gameState && payload.gameState.players) {
            setPlayers(payload.gameState.players);

            // 家計を更新
            if (typeof payload.gameState.household === "number") {
              setHousehold(payload.gameState.household);
            }

            // 自分の所持金と建物情報を更新
            const myPlayerData = payload.gameState.players.find(
              (p: Player) => p.id === newPlayerId
            );
            if (myPlayerData) {
              setMyCoins(myPlayerData.coins);
              setMyBuildings(myPlayerData.buildings || []);
              // 労働者数を設定
              setMyWorkers(myPlayerData.workers || 2);
              setTotalWorkers(myPlayerData.workers || 2);
            }

            // ラウンド情報も更新
            if (payload.gameState.round) {
              setRound(payload.gameState.round);
            }
          }

          // ガイドメッセージを設定
          if (payload.currentPlayer) {
            const isMyTurn = payload.currentPlayer.id === newPlayerId;
            setGuideMessage(
              isMyTurn
                ? "👉 あなたのターンです！労働者コマを配置してください"
                : `⏳ ${payload.currentPlayer.name}さんが労働者コマを配置中...`
            );
          }
          break;
        }

        case "hand_updated": {
          const payload = message.payload as { hand: Card[] };
          setMyHand(payload.hand);
          addLog(`🎴 更新`);
          break;
        }

        case "action_executed": {
          const payload = message.payload as { action: string };
          addLog(`⚡ ${payload.action}`);
          break;
        }

        case "building_built": {
          const payload = message.payload as { card: Card };
          addLog(`🏗️ ${payload.card.name}`);
          break;
        }

        case "resource_updated": {
          const payload = message.payload as {
            coins: number;
            playerId: string;
          };
          if (payload.playerId === newPlayerId) {
            setMyCoins(payload.coins);
          }
          addLog(`💰 ${payload.coins}`);
          break;
        }

        case "turn_changed": {
          const payload = message.payload as {
            currentPlayer: Player;
            round: number;
            gameState?: {
              household?: number;
              supply?: number;
              players?: Player[];
            };
          };
          setCurrentPlayer(payload.currentPlayer);
          setRound(payload.round);

          // 家計を更新
          if (payload.gameState) {
            if (typeof payload.gameState.household === "number") {
              setHousehold(payload.gameState.household);
            }

            // プレイヤー情報を更新（労働者数を含む）
            if (payload.gameState.players) {
              const myPlayerData = payload.gameState.players.find(
                (p: Player) => p.id === newPlayerId
              );
              if (myPlayerData) {
                // ラウンド開始時に総労働者数をリセット
                setTotalWorkers(myPlayerData.workers || 2);
                // 残り労働者数も更新
                setMyWorkers(myPlayerData.workers || 2);
              }
            }
          }

          addLog(`🔄 ターン変更`);

          // ガイドメッセージを更新
          const isMyTurn = payload.currentPlayer.id === newPlayerId;
          setGuideMessage(
            isMyTurn
              ? "👉 あなたのターンです！労働者コマを配置してください"
              : `⏳ ${payload.currentPlayer.name}さんが労働者コマを配置中...`
          );
          break;
        }

        case "round_ended": {
          // ラウンド終了時に賃金支払いモーダルを表示
          setShowWageModal(true);
          setGuideMessage("💸 ラウンド終了！賃金を支払ってください");
          addLog(`💸 賃金支払いフェーズ`);
          break;
        }

        case "hand_limit_exceeded": {
          // 手札上限超過時に手札調整モーダルを表示
          setShowHandModal(true);
          setGuideMessage(
            "🎴 手札が上限を超えています。カードを捨ててください"
          );
          addLog(`🎴 手札調整が必要です`);
          break;
        }

        case "game_finished": {
          // ゲーム終了時に最終スコアモーダルを表示
          const payload = message.payload as { results: GameResults };
          setGameResults(payload.results);
          setShowScoreModal(true);
          setGamePhase("finished");
          addLog(`🏁 ゲーム終了！`);
          break;
        }

        case "buildings_updated": {
          const payload = message.payload as {
            buildings: Card[];
            playerId: string;
          };
          if (payload.playerId === newPlayerId) {
            setMyBuildings(payload.buildings);
          }
          break;
        }

        case "worker_placed": {
          const payload = message.payload as {
            workplaceId: string;
            playerId: string;
            placedWorkers: Record<string, Record<string, number>>;
            remainingWorkers: number;
          };
          // 配置情報を更新
          const newPlacedWorkers = new Map<string, Map<string, number>>();
          Object.entries(payload.placedWorkers).forEach(([pid, workplaces]) => {
            const workplaceMap = new Map<string, number>();
            Object.entries(workplaces).forEach(([wid, count]) => {
              workplaceMap.set(wid, count);
            });
            newPlacedWorkers.set(pid, workplaceMap);
          });
          setPlacedWorkers(newPlacedWorkers);

          // 自分の労働者数を更新
          if (payload.playerId === newPlayerId) {
            setMyWorkers(payload.remainingWorkers);
          }

          addLog(`👷 労働者配置`);
          break;
        }

        case "workplace_effect_applied": {
          const payload = message.payload as {
            message: string;
            playerId: string;
          };
          if (payload.playerId === newPlayerId) {
            addLog(`✨ ${payload.message}`);
          }
          break;
        }

        default:
          console.log("Unknown message type:", message.type);
      }
    };

    websocket.onerror = () => {
      addLog(`❌ エラー`);
    };

    websocket.onclose = () => {
      addLog(`🔌 切断`);
    };

    return () => {
      websocket.close();
    };
  }, [roomId]);

  const handleReady = () => {
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "ready",
          payload: { playerId },
          timestamp: Date.now(),
        })
      );
    }
  };

  const handleBuildCard = (buildingId: string, discardCardIds: string[]) => {
    if (ws && ws.readyState === 1 && currentPlayer?.id === playerId) {
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "build_card",
            data: { buildingId, discardCardIds },
          },
          timestamp: Date.now(),
        })
      );
      setShowBuildModal(false);
    }
  };

  const handleDiscardForWorkplace = (
    workplaceId: string,
    discardCardIds: string[]
  ) => {
    if (ws && ws.readyState === 1 && currentPlayer?.id === playerId) {
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "use_workplace",
            data: { workplaceId, discardCardIds },
          },
          timestamp: Date.now(),
        })
      );
      setShowDiscardModal(false);
      setDiscardModalConfig(null);
    }
  };

  // モーダルハンドラー
  const handlePayWage = () => {
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "pay_wage",
            data: {},
          },
          timestamp: Date.now(),
        })
      );
      setShowWageModal(false);
      // ガイドメッセージを更新
      const isMyTurn = currentPlayer?.id === playerId;
      setGuideMessage(
        isMyTurn
          ? "👉 あなたのターンです！労働者コマを配置してください"
          : `⏳ ${currentPlayer?.name}さんが労働者コマを配置中...`
      );
    }
  };

  const handleSellBuilding = (buildingId: string) => {
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "sell_building",
            data: { buildingId },
          },
          timestamp: Date.now(),
        })
      );
    }
  };

  const handleDiscardCard = (cardId: string) => {
    if (ws && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "discard_card",
            data: { cardId },
          },
          timestamp: Date.now(),
        })
      );
      // 手札から削除
      setMyHand((prev: Card[]) => prev.filter((c: Card) => c.id !== cardId));
    }
  };

  const handleConfirmHandAdjustment = () => {
    setShowHandModal(false);
    // ガイドメッセージを更新
    const isMyTurn = currentPlayer?.id === playerId;
    setGuideMessage(
      isMyTurn
        ? "👉 あなたのターンです！労働者コマを配置してください"
        : `⏳ ${currentPlayer?.name}さんが労働者コマを配置中...`
    );
  };

  const handlePlaceWorker = (workplaceId: string) => {
    console.log(
      `[GameRoom] handlePlaceWorker called: workplaceId=${workplaceId}, isMyTurn=${currentPlayer?.id === playerId}, ws.readyState=${ws?.readyState}`
    );

    if (ws && ws.readyState === 1 && currentPlayer?.id === playerId) {
      console.log(`[GameRoom] Sending place_worker action for ${workplaceId}`);
      ws.send(
        JSON.stringify({
          type: "action",
          payload: {
            playerId,
            actionType: "place_worker",
            data: { workplaceId },
          },
          timestamp: Date.now(),
        })
      );
    } else {
      console.warn(
        `[GameRoom] Cannot place worker: ws=${!!ws}, readyState=${ws?.readyState}, isMyTurn=${currentPlayer?.id === playerId}`
      );
    }
  };

  const isMyTurn = currentPlayer?.id === playerId;
  const myPlayer = players.find((p: Player) => p.id === playerId);
  const allReady = players.length > 0 && players.every((p: Player) => p.ready);
  const myReady = myPlayer?.ready || false;

  return (
    <div style={styles.gameBoard}>
      {/* 待機ルーム（ロビー） */}
      {gamePhase === "lobby" && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "12px",
            margin: "20px auto",
            maxWidth: "600px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "24px",
              marginBottom: "10px",
              color: "#2c3e50",
            }}
          >
            🎮 ナショナルエコノミー
          </h1>
          <div
            style={{
              textAlign: "center",
              fontSize: "14px",
              color: "#7f8c8d",
              marginBottom: "20px",
            }}
          >
            ルームID: <strong>{roomId}</strong>
          </div>

          {/* プレイヤー人数表示 */}
          <div
            style={{
              backgroundColor: playerCount >= 2 ? "#d4edda" : "#fff3cd",
              border: `2px solid ${playerCount >= 2 ? "#28a745" : "#ffc107"}`,
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {playerCount}/4 人
            </div>
            <div style={{ fontSize: "12px", marginTop: "5px", color: "#666" }}>
              {playerCount < 2
                ? "⏳ あと" + (2 - playerCount) + "人待っています..."
                : playerCount === 4
                  ? "✅ 満員です"
                  : `✅ ${playerCount}人で開始できます（最大4人）`}
            </div>
          </div>

          {/* プレイヤーリスト */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: "#2c3e50",
              }}
            >
              👥 参加プレイヤー
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {players.map((p: Player) => (
                <div
                  key={p.id}
                  style={{
                    padding: "8px",
                    backgroundColor: p.id === playerId ? "#e8f5e9" : "#f5f5f5",
                    border: `1px solid ${p.id === playerId ? "#4caf50" : "#ddd"}`,
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: "600" }}>
                    {p.name} {p.id === playerId && "（あなた）"}
                  </div>
                </div>
              ))}
              {/* 空きスロット表示 */}
              {[...Array(Math.max(0, 2 - playerCount))].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  style={{
                    padding: "12px",
                    backgroundColor: "#fafafa",
                    border: "2px dashed #ddd",
                    borderRadius: "6px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "12px",
                  }}
                >
                  プレイヤー待機中...
                </div>
              ))}
            </div>
          </div>

          {/* 準備ボタン */}
          <button
            onClick={handleReady}
            disabled={myReady || playerCount < 2}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: myReady
                ? "#95a5a6"
                : playerCount >= 2
                  ? "#28a745"
                  : "#95a5a6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: myReady || playerCount < 2 ? "not-allowed" : "pointer",
              opacity: myReady || playerCount < 2 ? 0.6 : 1,
              transition: "all 0.2s",
            }}
          >
            {myReady
              ? "✅ 準備完了 - 他のプレイヤーを待っています"
              : playerCount < 2
                ? `⏳ プレイヤーが足りません（${playerCount}/2人）`
                : "🎮 準備完了"}
          </button>

          {/* 開始待機メッセージ */}
          {allReady && playerCount >= 2 && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                backgroundColor: "#d1ecf1",
                border: "2px solid #17a2b8",
                borderRadius: "6px",
                textAlign: "center",
                fontSize: "14px",
                color: "#0c5460",
                fontWeight: "bold",
              }}
            >
              🎉 全員準備完了！まもなくゲーム開始...
            </div>
          )}
        </div>
      )}

      {/* 並び順ルーレット画面 */}
      {showPlayerOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "40px",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: "28px",
                marginBottom: "30px",
                color: "#2c3e50",
              }}
            >
              🎲 並び順決定！
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {playerOrder.map(
                (
                  player: {
                    id: string;
                    name: string;
                    order: number;
                    coins: number;
                  },
                  index: number
                ) => (
                  <div
                    key={player.id}
                    style={{
                      padding: "20px",
                      backgroundColor: index === 0 ? "#ffd700" : "#f0f0f0",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "18px",
                      fontWeight: "bold",
                      border:
                        player.id === playerId ? "3px solid #3498db" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: index === 0 ? "#ff6b6b" : "#4ecdc4",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        {player.order}
                      </div>
                      <div>{player.name}</div>
                      {player.id === playerId && (
                        <span style={{ color: "#3498db", fontSize: "14px" }}>
                          (あなた)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "20px", color: "#27ae60" }}>
                      💰 ${player.coins}
                    </div>
                  </div>
                )
              )}
            </div>
            <div
              style={{
                marginTop: "25px",
                textAlign: "center",
                fontSize: "14px",
                color: "#7f8c8d",
              }}
            >
              まもなくゲーム開始...
            </div>
          </div>
        </div>
      )}

      {/* ゲーム画面（従来のUI） */}
      {gamePhase === "ingame" && (
        <>
          {/* ガイドメッセージ */}
          {guideMessage && (
            <div style={styles.guideMessageSection}>
              <div style={styles.guideMessageText}>{guideMessage}</div>
            </div>
          )}

          {/* ステータスバー（1行目） */}
          <div style={styles.statusBar}>
            <div style={{ ...styles.statusBox, ...styles.statusBoxRound }}>
              <div style={styles.statusLabel}>ラウンド</div>
              <div style={styles.statusValue}>{round}/9</div>
            </div>
            <div style={{ ...styles.statusBox, ...styles.statusBoxWorker }}>
              <div style={styles.statusLabel}>賃金レート</div>
              <div style={styles.statusValue}>${wagePerWorker}/人</div>
            </div>
            <div style={{ ...styles.statusBox, ...styles.statusBoxCoin }}>
              <div style={styles.statusLabel}>💰 所持金</div>
              <div style={styles.statusValue}>${myCoins}</div>
            </div>
          </div>

          {/* ステータスバー（2行目） */}
          <div style={styles.statusBarSecond}>
            <div style={{ ...styles.statusBox, ...styles.statusBoxWorker }}>
              <div style={styles.statusLabel}>労働者</div>
              <div style={styles.statusValue}>
                {myWorkers}/{totalWorkers}
              </div>
            </div>
            <div style={{ ...styles.statusBox, ...styles.statusBoxScore }}>
              <div style={styles.statusLabel}>🏆 勝利点</div>
              <div style={styles.statusValue}>{victoryTokens}</div>
            </div>
            <div style={{ ...styles.statusBox, ...styles.statusBoxLoan }}>
              <div style={styles.statusLabel}>💸 未払賃金</div>
              <div style={styles.statusValue}>{unpaidDebt}枚</div>
            </div>
          </div>

          {/* 共有カードエリア (テーブル中央) */}
          <div style={styles.publicCardsSection}>
            <div style={styles.publicCardsTitle}>🏛️ 公共職場</div>

            {/* ラウンドカード表示 */}
            <div style={styles.roundCardDisplay}>
              ラウンド {currentRoundCard.round} | 賃金: $
              {currentRoundCard.wagePerWorker}/人 | 家計: ${household}
            </div>

            <div style={styles.publicCardsGrid}>
              {publicCards.map((card: Card) => {
                const myPlacedWorkerCount =
                  placedWorkers.get(playerId)?.get(card.id) || 0;
                const totalPlacedWorkers = Array.from(
                  placedWorkers.values()
                ).reduce(
                  (sum: number, workplaceMap: Map<string, number>) =>
                    sum + (workplaceMap.get(card.id) || 0),
                  0
                );

                if (totalPlacedWorkers > 0) {
                  console.log(
                    `[GameRoom] Card ${card.id}: total=${totalPlacedWorkers}, my=${myPlacedWorkerCount}, placedWorkers=`,
                    Array.from(placedWorkers.entries()).map(([pid, wm]) => [
                      pid,
                      Array.from(wm.entries()),
                    ])
                  );
                }

                return (
                  <div key={card.id} style={{ position: "relative" as const }}>
                    <div
                      style={{
                        ...styles.cardSlot,
                        cursor:
                          isMyTurn && myWorkers > 0 && totalPlacedWorkers === 0
                            ? "pointer"
                            : "not-allowed",
                        opacity: totalPlacedWorkers > 0 ? 0.7 : 1,
                      }}
                      onDoubleClick={() => {
                        console.log(
                          `[GameRoom] Public card double-clicked: ${card.id}, isMyTurn=${isMyTurn}, myWorkers=${myWorkers}, totalPlacedWorkers=${totalPlacedWorkers}, allowMultiple=${card.allowMultipleWorkers}`
                        );
                        if (
                          isMyTurn &&
                          myWorkers > 0 &&
                          (card.allowMultipleWorkers ||
                            totalPlacedWorkers === 0)
                        ) {
                          handlePlaceWorker(card.id);
                        } else {
                          console.warn(
                            `[GameRoom] Cannot place worker on public card`
                          );
                        }
                      }}
                      onTouchEnd={() => {
                        const now = Date.now();
                        if (
                          lastTapRef.current.id === card.id &&
                          now - lastTapRef.current.time < 400
                        ) {
                          console.log(
                            `[GameRoom] Public card double-tap detected (touch): ${card.id}`
                          );
                          if (
                            isMyTurn &&
                            myWorkers > 0 &&
                            (card.allowMultipleWorkers ||
                              totalPlacedWorkers === 0)
                          ) {
                            handlePlaceWorker(card.id);
                          } else {
                            console.warn(
                              `[GameRoom] Cannot place worker on public card (touch)`
                            );
                          }
                          lastTapRef.current = { id: undefined, time: 0 };
                        } else {
                          lastTapRef.current = { id: card.id, time: now };
                        }
                      }}
                    >
                      <CardImage card={card} />
                      {/* 配置労働者カウント */}
                      {totalPlacedWorkers > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            left: "4px",
                            backgroundColor: "#ff6b6b",
                            color: "#fff",
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #fff",
                          }}
                        >
                          👷{totalPlacedWorkers}
                        </div>
                      )}
                      {/* 自分が配置した労働者 */}
                      {myPlacedWorkerCount > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            right: "4px",
                            backgroundColor: "#4ecdc4",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            border: "2px solid #fff",
                          }}
                        >
                          あなた: {myPlacedWorkerCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* プレイヤー情報 */}
          <div style={styles.playerSection}>
            <div style={styles.playerTitle}>👥 プレイヤー</div>
            <div style={styles.playersList}>
              {players.map((p: Player) => (
                <div
                  key={p.id}
                  style={{
                    ...styles.playerCard,
                    ...(p.id === currentPlayer?.id
                      ? styles.playerCardActive
                      : {}),
                    ...(p.id === playerId ? styles.playerCardSelf : {}),
                  }}
                >
                  <div style={styles.playerName}>
                    {p.name} {p.id === currentPlayer?.id ? "👉" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 手札 */}
          <div style={styles.handSection}>
            <div style={styles.handTitle}>🎴 手札 ({myHand.length})</div>
            {myHand.length === 0 ? (
              <div
                style={{ textAlign: "center", color: "#999", padding: "20px" }}
              >
                手札なし
              </div>
            ) : (
              <div style={styles.handGrid}>
                {myHand.map((card: Card) => (
                  <div
                    key={card.id}
                    style={styles.handCard}
                    onMouseEnter={(e) => {
                      Object.assign(
                        e.currentTarget.style,
                        styles.handCardHover
                      );
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.currentTarget.style, {
                        backgroundColor: "#e8f4f8",
                        color: "#333",
                        transform: "scale(1)",
                        boxShadow: "none",
                      });
                    }}
                  >
                    <div style={{ fontSize: "14px" }}>🏗️</div>
                    <div style={{ fontSize: "9px", marginTop: "2px" }}>
                      {card.name}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        marginTop: "2px",
                      }}
                    >
                      💰{card.cost}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* プレイヤーの建築済みカード */}
          <div style={styles.builtCardsSection}>
            <div style={styles.builtCardsTitle}>🏗️ 建築済みカード</div>
            {myBuildings.length > 0 ? (
              <div style={styles.builtCardsGrid}>
                {myBuildings.map((card: Card) => {
                  const myPlacedWorkerCount =
                    placedWorkers.get(playerId)?.get(card.id) || 0;

                  return (
                    <div
                      key={card.id}
                      style={{ position: "relative" as const }}
                    >
                      <div
                        style={{
                          ...styles.builtCard,
                          cursor:
                            isMyTurn &&
                            myWorkers > 0 &&
                            myPlacedWorkerCount === 0
                              ? "pointer"
                              : "not-allowed",
                          opacity: myPlacedWorkerCount > 0 ? 0.7 : 1,
                        }}
                        onDoubleClick={() => {
                          console.log(
                            `[GameRoom] Private card double-clicked: ${card.id}, isMyTurn=${isMyTurn}, myWorkers=${myWorkers}, myPlacedWorkerCount=${myPlacedWorkerCount}`
                          );
                          if (
                            isMyTurn &&
                            myWorkers > 0 &&
                            myPlacedWorkerCount === 0
                          ) {
                            handlePlaceWorker(card.id);
                          } else {
                            console.warn(
                              `[GameRoom] Cannot place worker on private card`
                            );
                          }
                        }}
                        onTouchEnd={() => {
                          const now = Date.now();
                          if (
                            lastTapRef.current.id === card.id &&
                            now - lastTapRef.current.time < 400
                          ) {
                            console.log(
                              `[GameRoom] Private card double-tap detected (touch): ${card.id}`
                            );
                            if (
                              isMyTurn &&
                              myWorkers > 0 &&
                              myPlacedWorkerCount === 0
                            ) {
                              handlePlaceWorker(card.id);
                            } else {
                              console.warn(
                                `[GameRoom] Cannot place worker on private card (touch)`
                              );
                            }
                            lastTapRef.current = { id: undefined, time: 0 };
                          } else {
                            lastTapRef.current = { id: card.id, time: now };
                          }
                        }}
                      >
                        <div style={{ fontSize: "14px" }}>✓</div>
                        <div style={{ fontSize: "9px", marginTop: "2px" }}>
                          {card.name}
                        </div>
                        {/* 配置労働者カウント */}
                        {myPlacedWorkerCount > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              backgroundColor: "#4ecdc4",
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "bold",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "2px solid #fff",
                            }}
                          >
                            👷{myPlacedWorkerCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{ textAlign: "center", color: "#999", padding: "20px" }}
              >
                建築済みカードなし
              </div>
            )}
          </div>

          {/* ゲームログ */}
          <div style={styles.logSection}>
            <div style={styles.logTitle}>📜 ログ</div>
            <div style={styles.gameLog}>
              {gameLog.length === 0 ? (
                <div style={{ textAlign: "center", color: "#ccc" }}>
                  ログなし
                </div>
              ) : (
                gameLog.map((log: string, i: number) => (
                  <div key={i} style={styles.logEntry}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* モーダル */}
          <WagePaymentModal
            isOpen={showWageModal}
            onClose={() => setShowWageModal(false)}
            wageAmount={wagePerWorker * myWorkers}
            currentMoney={myCoins}
            buildings={myBuildings}
            onSellBuilding={handleSellBuilding}
            onConfirm={handlePayWage}
          />

          <HandAdjustmentModal
            isOpen={showHandModal}
            hand={myHand}
            maxHandSize={10}
            onDiscardCard={handleDiscardCard}
            onConfirm={handleConfirmHandAdjustment}
          />

          <BuildCardModal
            isOpen={showBuildModal}
            onClose={() => setShowBuildModal(false)}
            hand={myHand}
            onConfirm={handleBuildCard}
          />

          {discardModalConfig && (
            <DiscardOnlyModal
              isOpen={showDiscardModal}
              onClose={() => setShowDiscardModal(false)}
              hand={myHand}
              requiredCount={discardModalConfig.requiredCount}
              title={discardModalConfig.title}
              onConfirm={(discardCardIds) =>
                handleDiscardForWorkplace(
                  discardModalConfig.workplaceId,
                  discardCardIds
                )
              }
            />
          )}

          {gameResults && (
            <FinalScoreModal
              isOpen={showScoreModal}
              results={gameResults}
              myPlayerId={playerId}
            />
          )}
        </>
      )}
    </div>
  );
}
