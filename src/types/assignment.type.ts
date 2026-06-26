import type { APIResponse, PageResponse } from "./common.type";

export interface AssignmentResponse {
  id: number;
  className: string;
  subjectName: string;
  teacherName: string;
  title: string;
  description: string;
  imageUrl: string;
  dueDate: string;
  createdAt: string;
}

export type AssignmentPageResponse = APIResponse<PageResponse<AssignmentResponse>>;
