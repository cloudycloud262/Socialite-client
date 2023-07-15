import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface CreateCommentArgs {
  body: string;
  postId: string;
}
interface Comment {
  _id: string;
  body: string;
  userId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  username: string;
}

export const commentApi = createApi({
  reducerPath: "comment",
  tagTypes: ["Comments"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BACKEND_URL}/comment`,
  }),
  endpoints: (builder) => ({
    getComments: builder.query<Comment[], string>({
      query: (postId) => ({
        url: `/${postId}`,
        credentials: "include",
      }),
      providesTags: (_res, _err, args) => [{ type: "Comments", id: args }],
    }),
    createComment: builder.mutation<string, CreateCommentArgs>({
      query: (body) => ({
        url: "/",
        body,
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: (_res, _err, args) => [
        { type: "Comments", id: args.postId },
      ],
    }),
    deleteComment: builder.mutation<string, { postId: string; id: string }>({
      query: ({ id }) => ({
        url: `/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted({ postId, id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          commentApi.util.updateQueryData("getComments", postId, (draft) =>
            draft.filter((post) => post._id !== id)
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
