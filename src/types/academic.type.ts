import type { APIResponse, PageResponse } from "./common.type";

export interface SchoolClassResponse {
  id: number;
  name: string;
  grade: number;
  academicYear: string;
}

export interface SemesterResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SubjectResponse {
  id: number;
  code: string;
  name: string;
}

export type SchoolClassPageResponse = APIResponse<PageResponse<SchoolClassResponse>>;
export type SemesterPageResponse = APIResponse<PageResponse<SemesterResponse>>;
export type SubjectPageResponse = APIResponse<PageResponse<SubjectResponse>>;

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

export interface TimetableRequest {
  classId: number;
  subjectId: number;
  teacherId: number;
  dayOfWeek: number;
  period: string;
  startTime: string;
  endTime: string;
  room: string;
  note: string;
  isExam: boolean;
}

export interface AssignmentRequest {
  classId: number;
  subjectId: number;
  teacherId: number;
  title: string;
  description: string;
  imageUrl: string;
  dueDate: string;
}

export interface AssignmentResponse {
  id: number;
  classId: number;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  title: string;
  description: string;
  imageUrl: string;
  dueDate: string;
  createdAt?: string;
}

export interface StudentGradeResponse {
  studentId: number;
  studentName: string;
  rollNumber: string;
  avatarUrl: string;
  gradeId?: number;
  midtermScore?: number;
  finalScore?: number;
  averageScore?: number;
}

export interface GradeRequest {
  studentId: number;
  subjectId: number;
  semesterId: number;
  midtermScore?: number;
  finalScore?: number;
}
