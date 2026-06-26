import { baseApi } from "./baseApi";
import type { AssignmentPageResponse } from "../../types/assignment.type";

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query<AssignmentPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/assignments",
        params,
      }),
      providesTags: ["Assignments"],
    }),
  }),
});

export const { useGetAssignmentsQuery } = assignmentApi;
