import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./userApi";

interface LoginArgs {
  email: string;
  password: string;
}
interface SignupArgs extends LoginArgs {
  username: string;
}
interface User {
  _id: string;
  email: string;
  username: string;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  postsCount: number;
  nfReadTime: string;
  hasPassword: boolean;
  isVerified: boolean;
  displayPicture: string;
  coverPicture: string;
  __v: number;
}
interface UpdateArgs {
  email: string;
  username: string;
  password?: string;
  currPassword: string;
  isUpdatingPassword: boolean;
  displayPicture: string;
  coverPicture: string;
}

export const authApi = createApi({
  reducerPath: "auth",
  tagTypes: ["CurrentUser"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_URL}/api/auth`,
  }),
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/getcurrentuser",
        credentials: "include",
      }),
      providesTags: ["CurrentUser"],
    }),
    signup: builder.mutation<string, SignupArgs>({
      query: (body) => ({
        url: "/signup",
        body,
        credentials: "include",
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["CurrentUser"] : []),
    }),
    login: builder.mutation<string, LoginArgs>({
      query: (body) => ({
        url: "/login",
        body,
        credentials: "include",
        method: "POST",
      }),
      invalidatesTags: (res) => (res ? ["CurrentUser"] : []),
    }),
    logout: builder.mutation<string, void>({
      query: () => ({
        url: "/logout",
        credentials: "include",
      }),
      invalidatesTags: (res) => (res ? ["CurrentUser"] : []),
    }),
    verifyEmail: builder.mutation<string, { userId: string; token: string }>({
      query: ({ userId, token }) => ({
        url: `/email/verify/${userId}/${token}`,
      }),
    }),
    resendVerification: builder.mutation<string, void>({
      query: () => ({
        url: `/email/verify/resend`,
        credentials: "include",
      }),
    }),
    createUpdatePasswordLink: builder.mutation<string, { email: string }>({
      query: (body) => ({
        url: "/password/update/createlink",
        body,
        method: "POST",
        credentials: "include",
      }),
    }),
    updatePassword: builder.mutation<
      string,
      { userId: string; password: string }
    >({
      query: (body) => ({
        url: "/password/update",
        method: "POST",
        params: { isUpdatingPassword: true },
        body,
        credentials: "include",
      }),
    }),
    verifyUpdatePasswordLink: builder.query<
      string,
      { token: string; userId: string }
    >({
      query: ({ token, userId }) => ({
        url: `/password/update/verifylink/${userId}/${token}`,
        credentials: "include",
      }),
    }),
    updateProfile: builder.mutation<string, UpdateArgs>({
      query: ({ isUpdatingPassword, ...body }) => ({
        url: "/update",
        params: { isUpdatingPassword },
        body,
        credentials: "include",
        method: "PATCH",
      }),
      async onQueryStarted({}, { queryFulfilled, getState, dispatch }) {
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        try {
          await queryFulfilled;
          dispatch(
            userApi.util.invalidateTags([{ type: "User", id: currUserId }])
          );
        } catch {}
      },
      invalidatesTags: (res) => (res ? ["CurrentUser"] : []),
    }),
    deleteAccount: builder.mutation<string, string>({
      query: (currPassword) => ({
        url: "/delete",
        body: { currPassword },
        credentials: "include",
        method: "DELETE",
      }),
      invalidatesTags: (res) => (res ? ["CurrentUser"] : []),
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useSignupMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useCreateUpdatePasswordLinkMutation,
  useVerifyUpdatePasswordLinkQuery,
  useUpdatePasswordMutation,
} = authApi;
