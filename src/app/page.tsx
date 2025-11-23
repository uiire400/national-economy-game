"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const styles = {
  container: {
    minHeight: "100vh",
    padding: "15px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "3px solid #2c3e50",
  },
  title: {
    margin: "10px 0",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    margin: "5px 0",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "2px solid #3498db",
    color: "#2c3e50",
  },
  buttonLarge: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "white",
    marginBottom: "10px",
  },
  buttonPrimary: {
    backgroundColor: "#2ecc71",
  },
  buttonSecondary: {
    backgroundColor: "#3498db",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  input: {
    padding: "14px",
    fontSize: "16px",
    border: "2px solid #ecf0f1",
    borderRadius: "6px",
    width: "100%",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: "10px 0",
    fontSize: "14px",
    borderBottom: "1px solid #ecf0f1",
    paddingLeft: "24px",
    position: "relative" as const,
  },
  listItemIcon: {
    position: "absolute" as const,
    left: 0,
    fontSize: "16px",
  },
  infoBox: {
    backgroundColor: "#ecf0f1",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#2c3e50",
    marginBottom: "10px",
    borderLeft: "4px solid #3498db",
  },
};

export default function Home() {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState("");
  const [createNickname, setCreateNickname] = useState("");
  const [joinNickname, setJoinNickname] = useState("");

  const handleCreateRoom = () => {
    if (!createNickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }
    const newRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    router.push(
      `/room/${newRoomId}?nickname=${encodeURIComponent(createNickname)}`
    );
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) {
      alert("ルームIDを入力してください");
      return;
    }
    if (!joinNickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }
    router.push(
      `/room/${inputRoomId.toUpperCase()}?nickname=${encodeURIComponent(joinNickname)}`
    );
  };

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎮 ナショナルエコノミー メシア</h1>
        <p style={styles.subtitle}>オンライン対戦ゲーム</p>
      </div>

      {/* 新規ゲーム作成 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>✨ 新しいゲームを作成</h2>
        <p style={{ fontSize: "13px", color: "#7f8c8d", marginBottom: "15px" }}>
          ニックネームを入力してルームを作成します。
        </p>
        <div style={styles.form}>
          <input
            type="text"
            placeholder="ニックネーム (例: プレイヤー1)"
            value={createNickname}
            onChange={(e) => setCreateNickname(e.target.value)}
            maxLength={12}
            style={styles.input}
          />
          <button
            onClick={handleCreateRoom}
            style={{ ...styles.buttonLarge, ...styles.buttonPrimary }}
            disabled={!createNickname.trim()}
          >
            新規ルーム作成 🆕
          </button>
        </div>
      </div>

      {/* 既存ゲーム参加 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🔗 ゲームに参加</h2>
        <p style={{ fontSize: "13px", color: "#7f8c8d", marginBottom: "15px" }}>
          ルームIDとニックネームを入力して参加します。
        </p>
        <form onSubmit={handleJoinRoom} style={styles.form}>
          <input
            type="text"
            placeholder="ルームID (例: ABC123)"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ ...styles.input, textTransform: "uppercase" }}
          />
          <input
            type="text"
            placeholder="ニックネーム (例: プレイヤー1)"
            value={joinNickname}
            onChange={(e) => setJoinNickname(e.target.value)}
            maxLength={12}
            style={styles.input}
          />
          <button
            type="submit"
            style={{ ...styles.buttonLarge, ...styles.buttonSecondary }}
            disabled={!inputRoomId.trim() || !joinNickname.trim()}
          >
            参加する 🎮
          </button>
        </form>
      </div>

      {/* ゲーム説明 */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📖 ゲーム説明</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span style={styles.listItemIcon}>👥</span>2〜4人でプレイ
          </li>
          <li style={styles.listItem}>
            <span style={styles.listItemIcon}>⚡</span>リアルタイム対戦
            (WebSocket)
          </li>
          <li style={styles.listItem}>
            <span style={styles.listItemIcon}>♻️</span>
            ターン制のストラテジーゲーム
          </li>
          <li style={styles.listItem}>
            <span style={styles.listItemIcon}>🏗️</span>カード建設とリソース管理
          </li>
          <li style={styles.listItem}>
            <span style={styles.listItemIcon}>🏆</span>最終スコアで勝負を決める
          </li>
        </ul>
      </div>

      {/* 情報 */}
      <div style={styles.card}>
        <div style={styles.infoBox}>
          <strong>ℹ️ 重要</strong>
          <div style={{ marginTop: "6px", fontSize: "11px" }}>
            WebSocket サーバーが <code>ws://localhost:3001</code>{" "}
            で実行中である必要があります。
          </div>
          <div style={{ marginTop: "4px", fontSize: "11px" }}>
            開発時は <code>npm run dev:all</code> を実行してください。
          </div>
        </div>
      </div>

      {/* フッター */}
      <div
        style={{
          textAlign: "center",
          padding: "20px 0",
          fontSize: "11px",
          color: "#95a5a6",
        }}
      >
        <p>National Economy Messiah v1.0</p>
      </div>
    </div>
  );
}
