import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userApi } from "./userApi";

export interface Community {
  _id: string;
  title: string;
  creatorId: string;
  isFollowing: boolean;
  followersCount: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  __v: number;
}
interface Communities {
  _id: string;
  title: string;
}
type GetCommunityArgs = {
  title?: string;
  creatorId?: string;
  following?: string;
};
type CreateCommunityArgs = {
  title: string;
};
interface UpdateCommunityArgs extends CreateCommunityArgs {
  id: string;
}

export const communityApi = createApi({
  reducerPath: "community",
  tagTypes: ["Community"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_REWRITE_URL}/community`,
  }),
  endpoints: (builder) => ({
    getCommunities: builder.query<Communities[], GetCommunityArgs>({
      query: (params) => ({
        url: "/",
        params,
        credentials: "include",
      }),
      providesTags: ["Community"],
    }),
    getCommunity: builder.query<Community, string>({
      query: (id) => ({
        url: `/${id}`,
        credentials: "include",
      }),
    }),
    createCommunity: builder.mutation<Community, CreateCommunityArgs>({
      query: (body) => ({
        url: "/",
        body,
        method: "POST",
        credentials: "include",
      }),
      async onQueryStarted(_body, { dispatch, queryFulfilled, getState }) {
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        const patchResult = dispatch(
          userApi.util.updateQueryData("getUser", currUserId, (draft) => ({
            ...draft,
            communityCount: draft.communityCount + 1,
          }))
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (res) => [{ type: "Community", id: res?.creatorId }],
    }),
    updateCommunity: builder.mutation<string, UpdateCommunityArgs>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        body,
        method: "PATCH",
        credentials: "include",
      }),
      async onQueryStarted({ id, ...body }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          communityApi.util.updateQueryData("getCommunity", id, (draft) => ({
            ...draft,
            ...body,
          }))
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteCommunity: builder.mutation<Community, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted(_body, { dispatch, queryFulfilled, getState }) {
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        const patchResult = dispatch(
          userApi.util.updateQueryData("getUser", currUserId, (draft) => ({
            ...draft,
            communityCount: draft.communityCount - 1,
          }))
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (res) => [{ type: "Community", id: res?.creatorId }],
    }),
    followCommunity: builder.mutation<string, string>({
      query: (id) => ({
        url: `/follow/${id}`,
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        const patchResult = [
          dispatch(
            userApi.util.updateQueryData("getUser", currUserId, (draft) => ({
              ...draft,
              followingCommCount: draft.followingCommCount + 1,
            }))
          ),
          dispatch(
            communityApi.util.updateQueryData("getCommunity", id, (draft) => ({
              ...draft,
              isFollowing: true,
              followersCount: draft.followersCount + 1,
            }))
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patchResult.forEach((pr) => pr.undo());
        }
      },
    }),
    unfollowCommunity: builder.mutation<string, string>({
      query: (id) => ({
        url: `/unfollow/${id}`,
        credentials: "include",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
        const currUserId = (getState() as any).auth.queries[
          "getCurrentUser(undefined)"
        ].data._id;
        const patchResult = [
          dispatch(
            userApi.util.updateQueryData("getUser", currUserId, (draft) => ({
              ...draft,
              followingCommCount: draft.followingCommCount - 1,
            }))
          ),
          dispatch(
            communityApi.util.updateQueryData("getCommunity", id, (draft) => ({
              ...draft,
              isFollowing: false,
              followersCount: draft.followersCount - 1,
            }))
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
  useGetCommunitiesQuery,
  useGetCommunityQuery,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
  useDeleteCommunityMutation,
  useFollowCommunityMutation,
  useUnfollowCommunityMutation,
} = communityApi;
