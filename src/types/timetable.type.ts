import type { APIResponse, PageResponse } from "./common.type";

export interface TimetableResponse {
  id: number;
  className: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: number;
  period: string;
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  isExam: boolean;
}

export type TimetablePageResponse = APIResponse<PageResponse<TimetableResponse>>;
