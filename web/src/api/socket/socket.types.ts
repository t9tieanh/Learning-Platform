export interface ChatMessage {
  user: string;
  message: string;
  timestamp: string;
}

export interface JoinRoomPayload {
  roomId: string;
  user: string;
}