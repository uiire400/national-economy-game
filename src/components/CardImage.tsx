"use client";

import { useState, useEffect } from "react";
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

let _availableCardFiles: Set<string> | null = null;

export default function CardImage({ card, style }: CardImageProps) {
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  // imgSrc is null until we determine whether an asset exists. This avoids
  // immediately setting a missing <img src> and causing console 404s.
  const [imgSrc, setImgSrc] = useState<string | null>(null);
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

  // Load the manifest of available card files (cached globally) to prevent
  // attempting to load images that don't exist and causing console 404s.
  // The manifest is a simple array of filenames (e.g. ["carpenter.svg"]).
  // It lives at /cards/index.json in the public folder.
  useEffect(() => {
    let mounted = true;

    async function ensureManifestAndChoose() {
      try {
        if (!_availableCardFiles) {
          const res = await fetch(`/cards/index.json`);
          if (!res.ok) {
            _availableCardFiles = new Set();
          } else {
            const list: string[] = await res.json();
            _availableCardFiles = new Set(list || []);
          }
        }

        if (!mounted) return;

        const pngName = `${card.id}.png`;
        const svgName = `${card.id}.svg`;
        if (_availableCardFiles.has(pngName)) {
          setImgSrc(`/cards/${pngName}`);
        } else if (_availableCardFiles.has(svgName)) {
          setImgSrc(`/cards/${svgName}`);
        } else {
          setImageError(true);
        }
      } catch (err) {
        // On any error, fallback to emoji rendering and log for debugging
        console.debug("CardImage: failed to load manifest", err);
        setImageError(true);
      }
    }

    ensureManifestAndChoose();

    return () => {
      mounted = false;
    };
  }, [card.id]);

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
        src={imgSrc || undefined}
        alt={card.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "4px",
          ...style,
        }}
        onError={() => {
          setImageError(true);
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
