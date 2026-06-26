import { baseApi } from "./baseApi";
import type { LeavePageResponse } from "../../types/leave.type";

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeaves: builder.query<LeavePageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/leaves",
        params,
      }),
      providesTags: ["Leaves"],
    }),
  }),
});

export const { useGetLeavesQuery } = leaveApi;
