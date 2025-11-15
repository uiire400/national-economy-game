"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import CardImage from "@/components/CardImage";

interface DiscardOnlyModalProps {
  isOpen: boolean;
  hand: Card[];
  requiredCount: number; // 破棄する枚数
  title: string; // モーダルタイトル（例：「2枚捨てて$12獲得」）
  onClose: () => void;
  onConfirm: (discardCardIds: string[]) => void;
}

export default function DiscardOnlyModal({
  isOpen,
  hand,
  requiredCount,
  title,
  onClose,
  onConfirm,
}: DiscardOnlyModalProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelection = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else if (selectedCards.length < requiredCount) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const handleConfirm = () => {
    if (selectedCards.length === requiredCount) {
      onConfirm(selectedCards);
      setSelectedCards([]);
    }
  };

  const handleClose = () => {
    setSelectedCards([]);
    onClose();
  };

  const modalOverlay = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
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
    maxWidth: "650px",
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto" as const,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
    textAlign: "center" as const,
  };

  const subtitle = {
    fontSize: "14px",
    color: "#666",
    textAlign: "center" as const,
    marginBottom: "20px",
  };

  const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  };

  const cardWrapper = {
    cursor: "pointer",
    transition: "transform 0.2s",
    position: "relative" as const,
    border: "2px solid transparent",
    borderRadius: "8px",
    padding: "4px",
  };

  const selectedCardStyle = {
    ...cardWrapper,
    border: "2px solid #ffc107",
    backgroundColor: "#fff8e1",
  };

  const buttonRow = {
    display: "flex",
    gap: "12px",
  };

  const button = {
    flex: 1,
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const cancelButton = {
    ...button,
    backgroundColor: "#6c757d",
    color: "#fff",
  };

  const confirmButton = {
    ...button,
    backgroundColor:
      selectedCards.length === requiredCount ? "#ffc107" : "#ccc",
    color: selectedCards.length === requiredCount ? "#000" : "#666",
    cursor: selectedCards.length === requiredCount ? "pointer" : "not-allowed",
  };

  return (
    <div style={modalOverlay} onClick={handleClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        <div style={subtitle}>
          {selectedCards.length}/{requiredCount}枚選択中
        </div>

        <div style={cardGrid}>
          {hand.map((card) => (
            <div
              key={card.id}
              style={
                selectedCards.includes(card.id)
                  ? selectedCardStyle
                  : cardWrapper
              }
              onClick={() => toggleSelection(card.id)}
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
              {selectedCards.includes(card.id) && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    backgroundColor: "#ffc107",
                    color: "#000",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={buttonRow}>
          <button style={cancelButton} onClick={handleClose}>
            キャンセル
          </button>
          <button
            style={confirmButton}
            onClick={handleConfirm}
            disabled={selectedCards.length !== requiredCount}
          >
            {selectedCards.length === requiredCount
              ? "確定"
              : `あと${requiredCount - selectedCards.length}枚選択`}
          </button>
        </div>
      </div>
    </div>
  );
}
