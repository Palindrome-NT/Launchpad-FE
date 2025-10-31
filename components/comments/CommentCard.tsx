'use client';

import React, { useState } from 'react';
import { useDeleteCommentMutation, useUpdateCommentMutation } from '../../lib/store/api/commentsApi';
import { Comment } from '../../lib/types/post';
import { Button } from '../ui';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, currentUserId }) => {
  console.log("🚀 ~ CommentCard ~ comment:--------->", comment);
  console.log("🚀 ~ CommentCard ~ currentUserId:", currentUserId);
  console.log("🚀 ~ CommentCard ~ comment.authorId._id:", comment.authorId._id);
  
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();

  const isOwner = currentUserId === comment.authorId._id;
  console.log("🚀 ~ CommentCard ~ isOwner:", isOwner);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment._id).unwrap();
        toast.success('Comment deleted successfully');
      } catch (error: any) {
        toast.error('Failed to delete comment');
        console.error('Delete error:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setShowActions(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      await updateComment({
        id: comment._id,
        data: { content: editContent.trim() },
      }).unwrap();
      
      toast.success('Comment updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Failed to update comment');
      console.error('Update error:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {comment.authorId?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                {comment.authorId?.name || 'Unknown User'}
              </h4>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            {isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 h-6 w-6"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
                
                {showActions && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border">
                    <div className="py-1">
                      <button
                        onClick={handleEdit}
                        className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Comment Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {editContent.length}/500 characters
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-7 px-3"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || editContent === comment.content}
                    className="h-7 px-3"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap text-sm">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
