import type { APIResponse, PageResponse } from "./common.type";

export interface ConversationResponse {
  id: number;
  name: string;
  type: string;
  lastMessage: string;
  lastUpdated: string;
}

export interface MessageResponse {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
}

export type ConversationPageResponse = APIResponse<PageResponse<ConversationResponse>>;
export type MessagePageResponse = APIResponse<PageResponse<MessageResponse>>;
