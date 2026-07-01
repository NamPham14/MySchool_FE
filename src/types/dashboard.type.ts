import type { APIResponse } from "./common.type";

export interface StudentByGradeData {
  name: string;
  students: number;
}

export interface RevenueByMonthData {
  month: string;
  revenue: number;
}

export interface DashboardOverviewResponse {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingLeaveRequests: number;
  totalRevenue: number;
  studentChartData: StudentByGradeData[];
  revenueChartData: RevenueByMonthData[];
}

export type DashboardAPIResponse = APIResponse<DashboardOverviewResponse>;
