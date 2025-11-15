import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ナショナルエコノミー メシア - オンライン対戦",
  description: "WebSocket を使用したリアルタイム対戦ゲーム",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
