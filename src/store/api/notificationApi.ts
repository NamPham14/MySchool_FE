import { baseApi } from "./baseApi";
import type { NotificationPageResponse } from "../../types/notification.type";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, void>({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<any, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<any, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<any, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} = notificationApi;
