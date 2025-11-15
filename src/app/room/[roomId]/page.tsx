"use client";

import { use } from "react";
import GameRoom from "../../../components/GameRoom";

export default function RoomPage(props: {
  params: Promise<{ roomId: string }>;
}) {
  const params = use(props.params);
  return <GameRoom roomId={params.roomId} />;
}
