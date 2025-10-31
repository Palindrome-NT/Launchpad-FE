import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { UsersListResponse, DeleteUserResponse } from '../../types/auth';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    getAllUsers: builder.query<UsersListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/users?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    getAllChatUsers: builder.query<UsersListResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/users/chat-user?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
    deleteUser: builder.mutation<DeleteUserResponse, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAllChatUsersQuery,
  useDeleteUserMutation,
} = usersApi;

