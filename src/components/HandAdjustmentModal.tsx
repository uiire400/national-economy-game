"use client";

import type { Card } from "@/lib/types";
import CardImage from "@/components/CardImage";

interface HandAdjustmentModalProps {
  isOpen: boolean;
  hand: Card[];
  maxHandSize: number;
  onDiscardCard: (cardId: string) => void;
  onConfirm: () => void;
}

export default function HandAdjustmentModal({
  isOpen,
  hand,
  maxHandSize,
  onDiscardCard,
  onConfirm,
}: HandAdjustmentModalProps) {
  if (!isOpen) return null;

  const excess = hand.length - maxHandSize;
  const canConfirm = hand.length <= maxHandSize;

  const modalOverlay = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContent = {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto" as const,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
  };

  const title = {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
    textAlign: "center" as const,
  };

  const infoBox = {
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#856404",
    textAlign: "center" as const,
  };

  const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  };

  const cardWrapper = {
    cursor: "pointer",
    transition: "transform 0.2s",
    position: "relative" as const,
  };

  const confirmButton = {
    width: "100%",
    padding: "14px",
    backgroundColor: canConfirm ? "#28a745" : "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: canConfirm ? "pointer" : "not-allowed",
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={title}>🎴 手札調整</div>

        <div style={infoBox}>
          手札が{maxHandSize}枚を超えています。{excess}枚捨ててください。
          <br />
          <strong>
            現在: {hand.length}枚 → 目標: {maxHandSize}枚
          </strong>
        </div>

        <div style={cardGrid}>
          {hand.map((card) => (
            <div
              key={card.id}
              style={cardWrapper}
              onClick={() => onDiscardCard(card.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <CardImage card={card} />
              <div
                style={{
                  fontSize: "10px",
                  textAlign: "center",
                  marginTop: "4px",
                  fontWeight: "bold",
                }}
              >
                {card.name}
              </div>
            </div>
          ))}
        </div>

        <button
          style={confirmButton}
          onClick={onConfirm}
          disabled={!canConfirm}
        >
          {canConfirm ? "確定" : `あと${excess}枚捨ててください`}
        </button>
      </div>
    </div>
  );
}
