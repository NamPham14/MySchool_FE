import { baseApi } from "./baseApi";
import type { DashboardAPIResponse } from "../../types/dashboard.type";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardAPIResponse, void>({
      query: () => "/v1/dashboard/overview",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
} = dashboardApi;
