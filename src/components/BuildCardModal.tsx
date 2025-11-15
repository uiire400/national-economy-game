"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import CardImage from "@/components/CardImage";

interface BuildCardModalProps {
  isOpen: boolean;
  hand: Card[]; // プレイヤーの手札
  onClose: () => void;
  onConfirm: (buildingId: string, discardCardIds: string[]) => void;
}

export default function BuildCardModal({
  isOpen,
  hand,
  onClose,
  onConfirm,
}: BuildCardModalProps) {
  const [step, setStep] = useState<"select_building" | "select_discard">(
    "select_building"
  );
  const [selectedBuilding, setSelectedBuilding] = useState<Card | null>(null);
  const [selectedDiscards, setSelectedDiscards] = useState<string[]>([]);

  if (!isOpen) return null;

  // 建物カードのみフィルター
  const buildingCards = hand.filter((card) => card.cardType === "building");
  const requiredDiscards = selectedBuilding?.cost || 0;

  const handleSelectBuilding = (card: Card) => {
    setSelectedBuilding(card);
    setSelectedDiscards([]);
    setStep("select_discard");
  };

  const toggleDiscardSelection = (cardId: string) => {
    if (selectedDiscards.includes(cardId)) {
      setSelectedDiscards(selectedDiscards.filter((id) => id !== cardId));
    } else if (selectedDiscards.length < requiredDiscards) {
      setSelectedDiscards([...selectedDiscards, cardId]);
    }
  };

  const handleConfirm = () => {
    if (selectedBuilding && selectedDiscards.length === requiredDiscards) {
      onConfirm(selectedBuilding.id, selectedDiscards);
      // リセット
      setStep("select_building");
      setSelectedBuilding(null);
      setSelectedDiscards([]);
    }
  };

  const handleBack = () => {
    setStep("select_building");
    setSelectedBuilding(null);
    setSelectedDiscards([]);
  };

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
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "16px",
    color: "#333",
    textAlign: "center" as const,
  };

  const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "12px",
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

  const selectedCard = {
    ...cardWrapper,
    border: "2px solid #28a745",
    backgroundColor: "#e7f5e7",
  };

  const buttonRow = {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
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

  const backButton = {
    ...button,
    backgroundColor: "#6c757d",
    color: "#fff",
  };

  const confirmButton = {
    ...button,
    backgroundColor:
      selectedDiscards.length === requiredDiscards ? "#28a745" : "#ccc",
    color: "#fff",
    cursor:
      selectedDiscards.length === requiredDiscards ? "pointer" : "not-allowed",
  };

  const closeButton = {
    ...button,
    backgroundColor: "#dc3545",
    color: "#fff",
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        {step === "select_building" ? (
          <>
            <div style={title}>🏗️ 建てる建物を選択</div>
            <div style={cardGrid}>
              {buildingCards.map((card) => (
                <div
                  key={card.id}
                  style={cardWrapper}
                  onClick={() => handleSelectBuilding(card)}
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
                      fontSize: "11px",
                      textAlign: "center",
                      marginTop: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    {card.name}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    コスト: {card.cost}枚
                  </div>
                </div>
              ))}
            </div>
            <button style={closeButton} onClick={onClose}>
              キャンセル
            </button>
          </>
        ) : (
          <>
            <div style={title}>
              🎴 捨てるカードを選択
              <br />
              <span style={{ fontSize: "14px", color: "#666" }}>
                {selectedBuilding?.name} - {selectedDiscards.length}/
                {requiredDiscards}枚選択中
              </span>
            </div>
            <div style={cardGrid}>
              {hand.map((card) => (
                <div
                  key={card.id}
                  style={
                    selectedDiscards.includes(card.id)
                      ? selectedCard
                      : cardWrapper
                  }
                  onClick={() => toggleDiscardSelection(card.id)}
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
                      fontSize: "11px",
                      textAlign: "center",
                      marginTop: "4px",
                    }}
                  >
                    {card.name}
                  </div>
                  {selectedDiscards.includes(card.id) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
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
              <button style={backButton} onClick={handleBack}>
                ← 戻る
              </button>
              <button
                style={confirmButton}
                onClick={handleConfirm}
                disabled={selectedDiscards.length !== requiredDiscards}
              >
                {selectedDiscards.length === requiredDiscards
                  ? "建設を確定"
                  : `あと${requiredDiscards - selectedDiscards.length}枚選択`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
