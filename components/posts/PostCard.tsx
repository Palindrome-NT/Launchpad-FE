'use client';

import React, { useState } from 'react';
import { useAppSelector } from '../../lib/store/hooks';
import { useDeletePostMutation, useToggleLikeMutation } from '../../lib/store/api/postsApi';
import { Post } from '../../lib/types/post';
import { Button, Card, CardContent } from '../ui';
import EditPostForm from './EditPostForm';
import Image from 'next/image';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostClick: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onPostClick }) => {
  const [showActions, setShowActions] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletePost] = useDeletePostMutation();
  const [toggleLike] = useToggleLikeMutation();

  const isOwner = currentUserId === post.authorId._id;
  const isLiked = post.isLiked || false;

  const handleLike = async () => {
    try {
      await toggleLike(post._id).unwrap();
    } catch (error: any) {
      toast.error('Failed to like post');
      console.error('Like error:', error);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowActions(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id).unwrap();
        toast.success('Post deleted successfully');
      } catch (error: any) {
        toast.error('Failed to delete post');
        console.error('Delete error:', error);
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
  };

  const handlePostClick = () => {
    onPostClick(post);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {post.authorId?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.authorId?.name || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="p-2"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 ${
              post.media.length === 1 ? 'grid-cols-1' : 
              post.media.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {post.media.map((url, index) => (
                <div key={index} className="relative group">
                  {post.mediaType?.[index] === 'video' ? (
                    <div className="relative">
                      <video
                        src={url}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                      {/* <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-2" />
                      </div> */}
                    </div>
                  ) : (
                    <Image
                      src={url}
                      alt={`Post media ${index + 1}`}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded-lg"
                      unoptimized
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likesCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePostClick}
              className="flex items-center space-x-2 text-gray-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount}</span>
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Post Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <EditPostForm
              post={post}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
