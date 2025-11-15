"use client";

import type { GameResults } from "@/lib/types";

interface FinalScoreModalProps {
  isOpen: boolean;
  results: GameResults;
  myPlayerId: string;
}

export default function FinalScoreModal({
  isOpen,
  results,
  myPlayerId,
}: FinalScoreModalProps) {
  if (!isOpen) return null;

  const modalOverlay = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContent = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "700px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto" as const,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  const title = {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
    textAlign: "center" as const,
  };

  const winner = results.ranking[0];
  const winnerBanner = {
    backgroundColor: "#ffd700",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
  };

  const rankingTable = {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginTop: "16px",
  };

  const thStyle = {
    backgroundColor: "#f8f9fa",
    padding: "12px 8px",
    textAlign: "left" as const,
    fontWeight: "bold",
    fontSize: "13px",
    borderBottom: "2px solid #dee2e6",
  };

  const tdStyle = {
    padding: "10px 8px",
    borderBottom: "1px solid #dee2e6",
    fontSize: "14px",
  };

  const getRankStyle = (rank: number) => {
    const baseStyle = { ...tdStyle, fontWeight: "bold", fontSize: "16px" };
    if (rank === 1) return { ...baseStyle, color: "#ffd700" };
    if (rank === 2) return { ...baseStyle, color: "#c0c0c0" };
    if (rank === 3) return { ...baseStyle, color: "#cd7f32" };
    return baseStyle;
  };

  const getRowStyle = (playerId: string) => {
    return playerId === myPlayerId
      ? { backgroundColor: "#e7f3ff" }
      : { backgroundColor: "#fff" };
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={title}>🏆 最終結果</div>

        <div style={winnerBanner}>
          🎉 優勝: {winner.name} ({winner.score}点) 🎉
        </div>

        <table style={rankingTable}>
          <thead>
            <tr>
              <th style={thStyle}>順位</th>
              <th style={thStyle}>プレイヤー</th>
              <th style={thStyle}>建物</th>
              <th style={thStyle}>ボーナス</th>
              <th style={thStyle}>資金</th>
              <th style={thStyle}>勝利点</th>
              <th style={thStyle}>負債</th>
              <th style={{ ...thStyle, fontWeight: "bold" }}>合計</th>
            </tr>
          </thead>
          <tbody>
            {results.ranking.map((player, index) => (
              <tr key={player.playerId} style={getRowStyle(player.playerId)}>
                <td style={getRankStyle(index + 1)}>
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && `${index + 1}位`}
                </td>
                <td style={tdStyle}>
                  <strong>{player.name}</strong>
                  {player.playerId === myPlayerId && " (あなた)"}
                </td>
                <td style={tdStyle}>{player.breakdown.buildings}</td>
                <td style={tdStyle}>{player.breakdown.endGameBonus}</td>
                <td style={tdStyle}>{player.breakdown.coins}</td>
                <td style={tdStyle}>{player.breakdown.victoryTokens}</td>
                <td style={{ ...tdStyle, color: "#dc3545" }}>
                  {player.breakdown.unpaidDebtPenalty < 0
                    ? player.breakdown.unpaidDebtPenalty
                    : "-"}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#28a745",
                  }}
                >
                  {player.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#6c757d",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            得点計算方法:
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px" }}>
            <li>建物: 各建物の資産価値の合計</li>
            <li>ボーナス: 建物の特殊効果による得点</li>
            <li>資金: 残った資金がそのまま得点</li>
            <li>勝利点: 3トークン=10点（余り1点/トークン）</li>
            <li>負債: 未払い賃金カード1枚につき-3点</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
