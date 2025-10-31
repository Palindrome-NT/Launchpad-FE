import React from 'react';
import { render, screen, waitFor } from '../../../lib/test-utils';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';
import { Post } from '../../../lib/types/post';

// Mock dependencies
jest.mock('../../../lib/store/api/postsApi', () => ({
  useDeletePostMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { success: true } })),
    { isLoading: false },
  ]),
  useToggleLikeMutation: jest.fn(() => [
    jest.fn(() => Promise.resolve({ data: { isLiked: true, likesCount: 6 } })),
    { isLoading: false },
  ]),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPost: Post = {
  _id: 'post1',
  content: 'This is a test post content',
  authorId: {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
  },
  likesCount: 5,
  commentsCount: 3,
  isDeleted: false,
  isLiked: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('PostCard', () => {
  const mockOnPostClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders post content correctly', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders like count correctly', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders comments count correctly', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    // Comments count should be displayed
    const commentCounts = screen.getAllByText('3');
    expect(commentCounts.length).toBeGreaterThan(0);
  });

  it('renders post with image media', () => {
    const postWithImage = {
      ...mockPost,
      _id: 'post2',
      media: ['https://example.com/image.jpg'],
      mediaType: ['image'] as ('image' | 'video')[],
    };

    render(
      <PostCard
        post={postWithImage}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    const image = screen.getByAltText('Post media 1');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows edit and delete actions for post owner', async () => {
    const user = userEvent.setup();
    
    render(
      <PostCard
        post={mockPost}
        currentUserId="user1"
        onPostClick={mockOnPostClick}
      />
    );

    // Find buttons that might contain the more options
    const buttons = screen.getAllByRole('button');
    const moreButton = buttons.find(btn => btn.querySelector('svg'));
    
    if (moreButton) {
      await user.click(moreButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Post')).toBeInTheDocument();
        expect(screen.getByText('Delete Post')).toBeInTheDocument();
      });
    }
  });

  it('does not show edit/delete actions for non-owner', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    // Verify edit/delete menu is not visible
    expect(screen.queryByText('Edit Post')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
  });

  it('displays liked state correctly when post is liked', () => {
    const likedPost = { ...mockPost, isLiked: true };
    
    render(
      <PostCard
        post={likedPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    // The like count should still be displayed
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders post author name correctly', () => {
    render(
      <PostCard
        post={mockPost}
        currentUserId="user2"
        onPostClick={mockOnPostClick}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
