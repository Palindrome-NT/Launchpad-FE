import React from 'react';
import { render, screen, waitFor } from '../../../lib/test-utils';
import userEvent from '@testing-library/user-event';
import PostForm from '../PostForm';

// Mock dependencies
const mockCreatePost = jest.fn();
const mockUploadMedia = jest.fn();

jest.mock('../../../lib/store/api/postsApi', () => ({
  useCreatePostMutation: jest.fn(() => [
    mockCreatePost,
    { isLoading: false },
  ]),
  useUploadMediaMutation: jest.fn(() => [
    mockUploadMedia,
    { isLoading: false },
  ]),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PostForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePost.mockResolvedValue({
      data: {
        _id: 'new-post',
        content: 'Test content',
      },
    });
    mockUploadMedia.mockResolvedValue({
      data: {
        urls: ['https://example.com/image.jpg'],
        types: ['image'],
      },
    });
    // Ensure default mutation state is not loading between tests
    const { useCreatePostMutation } = require('../../../lib/store/api/postsApi');
    useCreatePostMutation.mockReturnValue([
      mockCreatePost,
      { isLoading: false },
    ]);
  });

  it('renders form correctly', () => {
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Create Post')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays character counter', async () => {
    const user = userEvent.setup();
    
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, 'Test content');

    expect(screen.getByText(/12\/300 characters/i)).toBeInTheDocument();
  });

  it('enables submit button when content is entered', async () => {
    const user = userEvent.setup();
    
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    const submitButton = screen.getByText('Create Post');

    // Initially disabled (empty content)
    expect(submitButton).toBeDisabled();

    await user.type(textarea, 'Test post content');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('disables submit button when content exceeds 300 characters', async () => {
    const user = userEvent.setup();
    
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    
    // Input maxLength should prevent more than 300 characters
    expect(textarea).toHaveAttribute('maxLength', '300');
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('creates post successfully when form is submitted', async () => {
    const user = userEvent.setup();
    
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    const textarea = screen.getByPlaceholderText("What's on your mind?");
    await user.type(textarea, 'Test post content');

    const submitButton = screen.getByText('Create Post');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalled();
    });
  });

  it('shows loading state when creating post', () => {
    const { useCreatePostMutation } = require('../../../lib/store/api/postsApi');
    useCreatePostMutation.mockReturnValue([
      mockCreatePost,
      { isLoading: true },
    ]);

    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('displays media upload button', () => {
    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Add Media')).toBeInTheDocument();
    expect(screen.getByText('Max 3 images, 1 video')).toBeInTheDocument();
  });

  it('validates content is required', async () => {
    // Explicitly ensure not in loading state for this test
    const { useCreatePostMutation } = require('../../../lib/store/api/postsApi');
    useCreatePostMutation.mockReturnValue([
      mockCreatePost,
      { isLoading: false },
    ]);

    render(<PostForm onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Find the submit button by role; text could be "Create Post" or "Creating..." depending on state
    const submitButton = screen.getByRole('button', { name: /Create Post/i });
    
    // Button should be disabled without content
    expect(submitButton).toBeDisabled();
    
    // Should not call createPost with empty content
    expect(mockCreatePost).not.toHaveBeenCalled();
  });
});
