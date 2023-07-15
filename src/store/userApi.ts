import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { authApi } from "./authApi";

interface Users {
  _id: string;
  username: string;
}
interface User {
  _id: string;
  username: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isRequested: boolean;
  isPrivate: boolean;
  postsCount: number;
  chatId?: string;
}
type usersArgs = {
  username?: string;
  id?: string | undefined;
  type:
    | "Search"
    | "Followers"
    | "Following"
    | "SentRequest"
    | "ReceivedRequest";
};

export const userApi = createApi({
  reducerPath: "users",
  tagTypes: [
    "Search",
    "Followers",
    "Following",
    "User",
    "SentRequest",
    "ReceivedRequest",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/user`,
  }),
  endpoints: (builder) => ({
    getUsers: builder.query<Users[], usersArgs>({
      query: (params) => ({
        url: "/",
        params,
        credentials: "include",
      }),
      providesTags: (_res, _err, args) => [
        { type: args.type, id: args.id || "LIST" },
      ],
    }),
    getUser: builder.query<User, string>({
      query: (id) => ({ url: `/${id}`, credentials: "include" }),
      providesTags: (_res, _err, id) => [{ type: "User", id }],
    }),
    follow: builder.mutation<string, { id: string; isPrivate: boolean }>({
      query: ({ id }) => ({
        url: `/${id}/follow`,
        method: "PATCH",
        credentials: "include",
      }),
      async onQueryStarted(
        { id, isPrivate },
        { dispatch, queryFulfilled, getState }
      ) {
        const patchResult = isPrivate
          ? [
              dispatch(
                userApi.util.updateQueryData("getUser", id, (draft) => ({
                  ...draft,
                  isRequested: true,
                }))
              ),
            ]
          : [
              dispatch(
                authApi.util.updateQueryData(
                  "getCurrentUser",
                  undefined,
                  (draft) => ({
                    ...draft,
                    followingCount: draft.followingCount + 1,
                  })
                )
              ),
              dispatch(
                userApi.util.updateQueryData("getUser", id, (draft) => ({
                  ...draft,
                  isFollowing: true,
                  followersCount: draft.followersCount + 1,
                }))
              ),
            ];
        isPrivate
          ? dispatch(
              userApi.util.invalidateTags([{ type: "SentRequest", id: "LIST" }])
            )
          : dispatch(userApi.util.invalidateTags([{ type: "Followers", id }]));
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        dispatch(
          userApi.util.invalidateTags([{ type: "Following", id: currUserId }])
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.forEach((pr) => pr.undo());
        }
      },
    }),
    unfollow: builder.mutation<string, string>({
      query: (id) => ({
        url: `/${id}/unfollow`,
        method: "PATCH",
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const patchResult = [
          dispatch(
            userApi.util.updateQueryData("getUser", id, (draft) => ({
              ...draft,
              isFollowing: false,
              followersCount: draft.followersCount - 1,
            }))
          ),
          dispatch(
            authApi.util.updateQueryData(
              "getCurrentUser",
              undefined,
              (draft) => ({
                ...draft,
                followingCount: draft.followingCount - 1,
              })
            )
          ),
        ];
        dispatch(userApi.util.invalidateTags([{ type: "Followers", id }]));
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        dispatch(
          userApi.util.invalidateTags([{ type: "Following", id: currUserId }])
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.forEach((pr) => pr.undo());
        }
      },
    }),
    setPrivacy: builder.mutation<string, boolean>({
      query: (status) => ({
        url: "/setprivacy",
        credentials: "include",
        body: { status },
        method: "PATCH",
      }),
      async onQueryStarted(status, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          authApi.util.updateQueryData(
            "getCurrentUser",
            undefined,
            (draft) => ({
              ...draft,
              isPrivate: status,
            })
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    acceptRequest: builder.mutation({
      query: (id) => ({
        url: `/${id}/request/accept`,
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = [
          dispatch(
            userApi.util.updateQueryData("getUser", id, (draft) => ({
              ...draft,
              followingCount: draft.followingCount + 1,
            }))
          ),
          dispatch(
            authApi.util.updateQueryData(
              "getCurrentUser",
              undefined,
              (draft) => ({
                ...draft,
                followersCount: draft.followersCount + 1,
              })
            )
          ),
          dispatch(
            userApi.util.updateQueryData(
              "getUsers",
              { type: "ReceivedRequest" },
              (draft) => draft.filter((u) => u._id !== id)
            )
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patchResult.forEach((pr) => pr.undo());
        }
      },
    }),
    declineRequest: builder.mutation({
      query: (id) => ({
        url: `/${id}/request/decline`,
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          userApi.util.updateQueryData(
            "getUsers",
            { type: "ReceivedRequest" },
            (draft) => draft.filter((u) => u._id !== id)
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    removeRequest: builder.mutation<string, string>({
      query: (id) => ({
        url: `/${id}/request/remove`,
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = [
          dispatch(
            userApi.util.updateQueryData("getUser", id, (draft) => ({
              ...draft,
              isRequested: false,
            }))
          ),
          dispatch(
            userApi.util.updateQueryData(
              "getUsers",
              { type: "SentRequest" },
              (draft) => draft.filter((user) => user._id !== id)
            )
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patchResult.forEach((pr) => pr.undo());
        }
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useFollowMutation,
  useUnfollowMutation,
  useSetPrivacyMutation,
  useAcceptRequestMutation,
  useDeclineRequestMutation,
  useRemoveRequestMutation,
} = userApi;
