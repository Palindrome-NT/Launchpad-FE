import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import {
  Post,
  PostsResponse,
  PostResponse,
  CreatePostRequest,
  UpdatePostRequest,
  LikeResponse,
  UploadMediaResponse,
} from '../../types/post';

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'Comment'],
  endpoints: (builder) => ({
    // Get all posts
    getAllPosts: builder.query<Post[], void>({
      query: () => '/posts',
      transformResponse: (response: any) => response.data.items || [],
      providesTags: ['Post'],
    }),

    // Get post by ID
    getPostById: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      transformResponse: (response: PostResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Get user posts
    getUserPosts: builder.query<Post[], string>({
      query: (userId) => `/posts/user/${userId}`,
      transformResponse: (response: any) => response.data.items || [],
      providesTags: ['Post'],
    }),

    // Create post
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (postData) => ({
        url: '/posts',
        method: 'POST',
        body: postData,
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: ['Post'],
    }),

    // Update post
    updatePost: builder.mutation<Post, { id: string; data: UpdatePostRequest }>({
      query: ({ id, data }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: PostResponse) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }, 'Post'],
    }),

    // Delete post
    deletePost: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }, 'Post'],
    }),

    // Toggle like
    toggleLike: builder.mutation<{ isLiked: boolean; likesCount: number }, string>({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'POST',
      }),
      transformResponse: (response: LikeResponse) => response.data,
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }, 'Post'],
    }),

    // Upload media
    uploadMedia: builder.mutation<{ urls: string[]; types: ('image' | 'video')[] }, FormData>({
      query: (formData) => ({
        url: '/posts/upload',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: UploadMediaResponse) => ({
        urls: response.data.urls,
        types: response.data.types,
      }),
    }),
  }),
});

export const {
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useGetUserPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useUploadMediaMutation,
} = postsApi;
