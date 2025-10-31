'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/store/hooks';
import { checkAuthStatus } from '../../lib/store/thunks/authThunks';
import { useGetCommentsByPostQuery, useCreateCommentMutation } from '../../lib/store/api/commentsApi';
import { Post } from '../../lib/types/post';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';
import { Button } from '../ui';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface CommentsSectionProps {
  post: Post;
  onBack: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ post, onBack }) => {
  console.log("🚀 ~ CommentsSection ~ post:::::::::::", post)
  const [showCommentForm, setShowCommentForm] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: comments, isLoading, error } = useGetCommentsByPostQuery(post._id);
  
  // Debug logging
  console.log('🚀 ~ CommentsSection ~ comments:', comments);
  console.log('🚀 ~ CommentsSection ~ isLoading:', isLoading);
  console.log('🚀 ~ CommentsSection ~ error:', error);
  console.log('🚀 ~ CommentsSection ~ postId:', post._id);
  console.log('🚀 ~ CommentsSection ~ user:', user);
  console.log('🚀 ~ CommentsSection ~ user._id:', user?._id);

  useEffect(() => {
    // Check authentication status on mount to restore user from localStorage
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleCommentCreated = () => {
    setShowCommentForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Posts
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {post.authorId?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.authorId?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <p className="text-gray-900 whitespace-pre-wrap mb-4">{post.content}</p>
        
        {/* Media Display */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.media.length === 1 ? 'grid-cols-1' : 
              post.media.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {post.media.map((url, index) => (
                <div key={index} className="relative">
                  {post.mediaType?.[index] === 'video' ? (
                    <video
                      src={url}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({comments?.length || 0})
        </h2>
        {user && (
          <Button
            onClick={() => setShowCommentForm(!showCommentForm)}
            size="sm"
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </Button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && user && (
        <CommentForm
          postId={post._id}
          onSuccess={handleCommentCreated}
          onCancel={() => setShowCommentForm(false)}
        />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading comments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load comments</p>
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <MessageCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500">Be the first to comment on this post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
