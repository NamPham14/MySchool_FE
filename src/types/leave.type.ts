import type { APIResponse, PageResponse } from "./common.type";

export interface LeaveResponse {
  id: number;
  studentName: string;
  title: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export type LeavePageResponse = APIResponse<PageResponse<LeaveResponse>>;
