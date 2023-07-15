import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type notification = {
  _id: string;
  receiverId: string;
  senderId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  username: string;
  postId?: string;
  comment?: string;
};
export type NfsArgs = {
  limit?: number;
};

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  tagTypes: ["Notifications", "UnreadCount"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/notification`,
  }),
  endpoints: (builder) => ({
    getNotifications: builder.query<notification[], NfsArgs>({
      query: (params) => ({
        url: "/",
        params,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Notifications"],
    }),
    getNfUnreadCount: builder.query<number, string>({
      query: (nfReadTime) => ({
        url: "/unread",
        params: { nfReadTime },
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["UnreadCount"],
    }),
  }),
});

export const { useGetNotificationsQuery, useGetNfUnreadCountQuery } =
  notificationApi;
