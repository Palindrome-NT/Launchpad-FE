'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/store/hooks';
import { checkAuthStatus, logoutUser } from '../../lib/store/thunks/authThunks';
import PostForm from '../../components/posts/PostForm';
import PostCard from '../../components/posts/PostCard';
import CommentsSection from '../../components/comments/CommentsSection';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useGetAllPostsQuery } from '../../lib/store/api/postsApi';
import { Post } from '../../lib/types/post';
import { Button } from '../../components/ui';
import { ArrowLeft, Plus, LogOut, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const PostsPage: React.FC = () => {
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: session } = useSession();
  const { data: posts, isLoading, error } = useGetAllPostsQuery();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const isOAuthUser = !!session;
      
      // await dispatch(logoutUser()).unwrap();
      
      if (isOAuthUser) {
        await signOut({ redirect: false });
      }
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      if (session) {
        await signOut({ redirect: false });
      }
      
      router.push('/auth/login');
    }
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowComments(true);
  };

  const handleBackToPosts = () => {
    setShowComments(false);
    setSelectedPost(null);
  };

  const handlePostCreated = () => {
    setShowPostForm(false);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load posts</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {showComments ? 'Comments' : 'Posts'}
              </h1>
              <div className="flex items-center gap-3">
                {showComments && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToPosts}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                )}
                {!showComments && (
                  <Button
                    onClick={() => setShowPostForm(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    New Post
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/chat')}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                >
                  <span className="hidden sm:inline">Chat</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push('/lazy-loading')}
                  className='text-green-600 hover:text-green-800 hover:border-green-300'
                >
                  <span className="hidden sm:inline">Lazy-Load</span>
                </Button>
                {user && (user.role === 'admin' || user.role === 'superadmin') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard')}
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-6">
          {showComments ? (
            <CommentsSection
              post={selectedPost!}
              onBack={handleBackToPosts}
            />
          ) : (
            <div className="space-y-6">
              {/* Posts List */}
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUserId={user?._id}
                    onPostClick={handlePostClick}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-4">Be the first to share something!</p>
                  <Button onClick={() => setShowPostForm(true)}>
                    Create First Post
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Post Form Modal */}
        {showPostForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <PostForm
                onClose={() => setShowPostForm(false)}
                onSuccess={handlePostCreated}
              />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PostsPage;
