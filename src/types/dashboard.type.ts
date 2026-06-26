import type { APIResponse } from "./common.type";


export interface RevenueChartData {
    month: string;
    amount: number;
}

export interface DashboardResponse {
  totalRevenueMonth: number;
  rentRevenueMonth: number;
  otherRevenueMonth: number;
  totalRooms: number;    occupiedRooms: number;
    availableRooms: number;
    unpaidInvoices: number;
    revenueChart: RevenueChartData[];
}

export type DashboardSummaryResponse = APIResponse<DashboardResponse>;
