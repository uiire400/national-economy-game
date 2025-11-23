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
        {/* コストと資産価値を表示 */}
        {card.cost > 0 && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: "2px",
              backgroundColor: "#ffd700",
              color: "#000",
              fontSize: "9px",
              fontWeight: "bold",
              padding: "2px 4px",
              borderRadius: "3px",
              border: "1px solid #000",
            }}
          >
            💰{card.cost}
          </div>
        )}
        {card.assetValue !== undefined && card.assetValue > 0 && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              backgroundColor: "#4169e1",
              color: "#fff",
              fontSize: "9px",
              fontWeight: "bold",
              padding: "2px 4px",
              borderRadius: "3px",
              border: "1px solid #000",
            }}
          >
            🏆{card.assetValue}
          </div>
        )}
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "6px",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              zIndex: 1000,
              minWidth: "120px",
              maxWidth: "200px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              lineHeight: "1.4",
            }}
          >
            {effectDescription}
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
      {/* コストと資産価値を表示 */}
      {card.cost > 0 && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            backgroundColor: "#ffd700",
            color: "#000",
            fontSize: "9px",
            fontWeight: "bold",
            padding: "2px 4px",
            borderRadius: "3px",
            border: "1px solid #000",
          }}
        >
          💰{card.cost}
        </div>
      )}
      {card.assetValue !== undefined && card.assetValue > 0 && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            backgroundColor: "#4169e1",
            color: "#fff",
            fontSize: "9px",
            fontWeight: "bold",
            padding: "2px 4px",
            borderRadius: "3px",
            border: "1px solid #000",
          }}
        >
          🏆{card.assetValue}
        </div>
      )}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "6px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            zIndex: 1000,
            minWidth: "120px",
            maxWidth: "200px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            lineHeight: "1.4",
          }}
        >
          {effectDescription}
        </div>
      )}
    </div>
  );
}
