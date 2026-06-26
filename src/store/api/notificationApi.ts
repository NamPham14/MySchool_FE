import { baseApi } from "./baseApi";
import type { NotificationPageResponse } from "../../types/notification.type";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationPageResponse, { page?: number; size?: number }>({
      query: (params) => ({
        url: "/notifications",
        params,
      }),
      providesTags: ["Notifications"],
    }),
  }),
});

export const { useGetNotificationsQuery } = notificationApi;
