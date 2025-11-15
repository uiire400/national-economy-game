"use client";

import type { Card } from "@/lib/types";

interface WagePaymentModalProps {
  isOpen: boolean;
  wageAmount: number;
  currentMoney: number;
  buildings: Card[];
  onSellBuilding: (buildingId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function WagePaymentModal({
  isOpen,
  wageAmount,
  currentMoney,
  buildings,
  onSellBuilding,
  onConfirm,
  onClose,
}: WagePaymentModalProps) {
  if (!isOpen) return null;

  const deficit = Math.max(0, wageAmount - currentMoney);
  const canPay = currentMoney >= wageAmount;

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
    maxWidth: "500px",
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
    backgroundColor: "#f0f0f0",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
  };

  const warningBox = {
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#856404",
  };

  const buildingList = {
    display: "grid",
    gap: "8px",
    marginBottom: "16px",
  };

  const buildingItem = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "13px",
  };

  const sellButton = {
    padding: "6px 12px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "bold",
  };

  const buttonGroup = {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  };

  const confirmButton = {
    flex: 1,
    padding: "12px",
    backgroundColor: canPay ? "#28a745" : "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: canPay ? "pointer" : "not-allowed",
  };

  const closeButton = {
    flex: 1,
    padding: "12px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={title}>💸 賃金支払い</div>

        <div style={infoBox}>
          <div>
            必要な賃金: <strong>${wageAmount}</strong>
          </div>
          <div>
            現在の所持金: <strong>${currentMoney}</strong>
          </div>
          {deficit > 0 && (
            <div
              style={{ color: "#dc3545", fontWeight: "bold", marginTop: "8px" }}
            >
              不足額: ${deficit}
            </div>
          )}
        </div>

        {deficit > 0 && (
          <>
            <div style={warningBox}>
              ⚠️
              所持金が不足しています。建物を売却するか、未払い賃金として記録されます（-3点/枚）
            </div>

            {buildings.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  売却可能な建物:
                </div>
                <div style={buildingList}>
                  {buildings.map((building) => (
                    <div key={building.id} style={buildingItem}>
                      <span>
                        {building.icon} {building.name} ($
                        {building.assetValue || 0})
                      </span>
                      <button
                        style={sellButton}
                        onClick={() => onSellBuilding(building.id)}
                      >
                        売却
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div style={buttonGroup}>
          <button style={confirmButton} onClick={onConfirm} disabled={!canPay}>
            {canPay ? "支払う" : "未払い賃金として記録"}
          </button>
          <button style={closeButton} onClick={onClose}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
