import type { APIResponse } from "./common.type";

export interface AcademicSummaryResponse {
  id: number;
  gpa: number;
  academicPerformance: string;
  conduct: string;
  semesterName: string;
}

export interface GradeResponse {
  id: number;
  subjectName: string;
  subjectCode: string;
  midtermScore: number;
  finalScore: number;
  averageScore: number;
}

export interface GradeDashboardResponse {
  summary: AcademicSummaryResponse;
  details: GradeResponse[];
}

export type GradeDashboardAPIResponse = APIResponse<GradeDashboardResponse>;
