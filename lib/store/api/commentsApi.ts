import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import {
  Comment,
  CommentsResponse,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../../types/post';

export const commentsApi = createApi({
  reducerPath: 'commentsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Comment', 'Post'],
  endpoints: (builder) => ({
    // Get comments by post
    getCommentsByPost: builder.query<Comment[], string>({
      query: (postId) => `/comments/post/${postId}`,
      transformResponse: (response: any) => response.data.items || [],
      providesTags: (result, error, postId) => [
        { type: 'Comment', id: 'LIST' },
        ...(result?.map(({ _id }) => ({ type: 'Comment' as const, id: _id })) || []),
      ],
    }),

    // Get comments by user
    getCommentsByUser: builder.query<Comment[], string>({
      query: (userId) => `/comments/user/${userId}`,
      transformResponse: (response: any) => response.data.items || [],
      providesTags: ['Comment'],
    }),

    // Get comment by ID
    getCommentById: builder.query<Comment, string>({
      query: (id) => `/comments/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'Comment', id }],
    }),

    // Create comment
    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: (commentData) => ({
        url: '/comments',
        method: 'POST',
        body: commentData,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: 'LIST' },
        { type: 'Post', id: postId },
        'Post',
      ],
    }),

    // Update comment
    updateComment: builder.mutation<Comment, { id: string; data: UpdateCommentRequest }>({
      query: ({ id, data }) => ({
        url: `/comments/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Comment', id }, 'Comment'],
    }),

    // Delete comment
    deleteComment: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/comments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Comment', id },
        { type: 'Comment', id: 'LIST' },
        'Comment',
        'Post',
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostQuery,
  useGetCommentsByUserQuery,
  useGetCommentByIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
