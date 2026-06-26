import { baseApi } from "./baseApi";
import type { EventPageResponse } from "../../types/event.type";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/events",
        params,
      }),
      providesTags: ["Events"],
    }),
  }),
});

export const { useGetEventsQuery } = eventApi;
