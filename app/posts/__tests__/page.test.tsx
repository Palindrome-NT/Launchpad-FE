import React from 'react';
import { render, screen, waitFor } from '../../../lib/test-utils';
import userEvent from '@testing-library/user-event';
import PostsPage from '../page';

// Mock dependencies
jest.mock('../../../lib/store/api/postsApi', () => ({
  useGetAllPostsQuery: jest.fn(),
  useDeletePostMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { success: true } })),
    { isLoading: false },
  ]),
  useToggleLikeMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { isLiked: true, likesCount: 6 } })),
    { isLoading: false },
  ]),
  useCreatePostMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { _id: 'new', content: 'x' } })),
    { isLoading: false },
  ]),
  useUploadMediaMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { urls: [], types: [] } })),
    { isLoading: false },
  ]),
}));

jest.mock('../../../lib/store/thunks/authThunks', () => ({
  checkAuthStatus: jest.fn(() => ({ type: 'checkAuthStatus' })),
  logoutUser: jest.fn(() => ({ unwrap: jest.fn(() => Promise.resolve()) })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signOut: jest.fn(() => Promise.resolve()),
}));

const mockPosts = [
  {
    _id: '1',
    content: 'Test post 1',
    authorId: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    likesCount: 5,
    commentsCount: 2,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    content: 'Test post 2',
    authorId: {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    likesCount: 10,
    commentsCount: 3,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockUser = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user' as const,
  isVerified: true,
  isActive: true,
  isDeleted: false,
};

describe('PostsPage', () => {
  const mockUseGetAllPostsQuery = require('../../../lib/store/api/postsApi')
    .useGetAllPostsQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: true,
        },
      },
    });

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('renders error state when posts fail to load', () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Failed to fetch' },
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    expect(screen.getByText('Failed to load posts')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders posts list when posts are loaded', async () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Posts')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test post 1')).toBeInTheDocument();
    expect(screen.getByText('Test post 2')).toBeInTheDocument();
  });

  it('renders empty state when no posts exist', async () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to share something!')).toBeInTheDocument();
      expect(screen.getByText('Create First Post')).toBeInTheDocument();
    });
  });

  it('opens post form when "New Post" button is clicked', async () => {
    const user = userEvent.setup();
    mockUseGetAllPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    const newPostButton = await screen.findByRole('button', { name: /New Post/i });
    await user.click(newPostButton);

    // Wait for modal header
    await screen.findByRole('heading', { name: /Create New Post/i });
  });

  it('displays admin dashboard button for admin users', async () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    
    mockUseGetAllPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('does not display admin dashboard button for regular users', async () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  it('displays logout button', async () => {
    mockUseGetAllPostsQuery.mockReturnValue({
      data: mockPosts,
      isLoading: false,
      error: undefined,
    });

    render(<PostsPage />, {
      initialState: {
        auth: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});
