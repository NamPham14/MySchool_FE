import { baseApi } from "./baseApi";
import type { TimetablePageResponse } from "../../types/timetable.type";

export const timetableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTimetables: builder.query<TimetablePageResponse, { page?: number; size?: number; classId?: number }>({
      query: (params) => ({
        url: "/timetables",
        params,
      }),
      providesTags: ["Timetables"],
    }),
  }),
});

export const { useGetTimetablesQuery } = timetableApi;
