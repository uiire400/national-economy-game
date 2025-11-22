"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import { CARD_EFFECT_DESCRIPTIONS } from "@/lib/game/CardDefs";

interface CardImageProps {
  card: Card;
  style?: React.CSSProperties;
}

const cardEmojis: Record<string, string> = {
  mine: "⛏️",
  farm: "🌾",
  forest: "🌲",
  market: "🏪",
  house: "🏠",
  factory: "🏭",
  school: "🏫",
  church: "⛪",
  carpenter: "🔨",
  farmer: "👨‍🌾",
  merchant: "🧑‍💼",
  scholar: "📚",
};

export default function CardImage({ card, style }: CardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  const [imgSrc, setImgSrc] = useState(`/cards/${card.id}.png`);
  const emoji = cardEmojis[card.id] || "🎴";
  const effectDescription =
    CARD_EFFECT_DESCRIPTIONS[card.effect] || card.effect;

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 400); // 400ms長押し
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) clearTimeout(touchTimer);
    setTouchTimer(null);
  };

  const handleMouseLeave = () => {
    handleTouchEnd();
    setShowTooltip(false);
  };

  if (imageError) {
    // 画像が見つからない場合のフォールバック
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          position: "relative",
          ...style,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ fontSize: "28px" }}>{emoji}</div>
        <div
          style={{ fontSize: "10px", marginTop: "4px", textAlign: "center" }}
        >
          {card.name}
        </div>
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "4px",
              backgroundColor: "#333",
              color: "#fff",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "11px",
              zIndex: 1000,
              whiteSpace: "nowrap",
            }}
          >
            💡 {effectDescription}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={imgSrc}
        alt={card.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "4px",
          ...style,
        }}
        onError={() => {
          // png が無ければ svg を試す。それも無ければフォールバック表示へ
          if (imgSrc.endsWith(".png")) {
            setImgSrc(`/cards/${card.id}.svg`);
          } else {
            setImageError(true);
          }
        }}
      />
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "#333",
            color: "#fff",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "11px",
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          💡 {effectDescription}
        </div>
      )}
    </div>
  );
}
