import type { APIResponse, PageResponse } from "./common.type";

export interface EventResponse {
  id: number;
  title: string;
  categoryName: string;
  startDatetime: string;
  endDatetime: string;
  location: string;
  status: string;
}

export type EventPageResponse = APIResponse<PageResponse<EventResponse>>;
