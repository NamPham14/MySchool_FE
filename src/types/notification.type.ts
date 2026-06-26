import type { APIResponse, PageResponse } from "./common.type";

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  relatedId: number;
  createdAt: string;
}

export type NotificationPageResponse = APIResponse<PageResponse<NotificationResponse>>;
