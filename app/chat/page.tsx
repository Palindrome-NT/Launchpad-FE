'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../lib/store/hooks';
import { useGetAllChatUsersQuery } from '../../lib/store/api/usersApi';
import { useSocket } from '../../lib/socket/SocketContext';
import { checkAuthStatus, logoutUser } from '../../lib/store/thunks/authThunks';
import ProtectedRoute from '../../components/ProtectedRoute';
import UserListItem from '../../components/chat/UserListItem';
import ChatWindow from '../../components/chat/ChatWindow';
import { Button } from '../../components/ui';
import { MessageCircle, Users, LogOut, Loader2, Home, Zap, LayoutDashboard } from 'lucide-react';
import { User } from '../../lib/types/auth';
import { signOut, useSession } from 'next-auth/react';

const ChatPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllChatUsersQuery({ page: 1, limit: 100 });
  const { isConnected, onlineUsers } = useSocket();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const allUsers = usersData?.data?.items || [];
  
  // Filter out current user and get only active users
  const otherUsers = allUsers.filter(
    (u) => u._id !== user?._id && u.isActive && !u.isDeleted
  );

  // Check if a user is online
  const isUserOnline = (userId: string) => {
    return onlineUsers.some((onlineUser) => onlineUser.userId === userId);
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    setSelectedUser(null);
  };

  const handleLogout = async () => {
    try {
      const isOAuthUser = !!session;
      
      await dispatch(logoutUser()).unwrap();
      
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

  if (authLoading || usersLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Header/Navbar */}
        <header className="bg-white shadow-sm border-b z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Chat</h1>
              {isConnected && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/posts')}
                leftIcon={<Home className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Posts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/lazy-loading')}
                leftIcon={<Zap className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Lazy Load
              </Button>
              {user && (user.role === 'admin' || user.role === 'superadmin') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  leftIcon={<LayoutDashboard className="w-4 h-4" />}
                  className="hidden sm:flex"
                >
                  Dashboard
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
        </header>

        {/* Main Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Users List Sidebar - Desktop: always visible, Mobile: hidden when chat open */}
          <aside
            className={`${
              showMobileChat ? 'hidden lg:flex' : 'flex'
            } lg:w-80 w-full flex-col bg-white border-r`}
          >
            <div className="p-4 border-b bg-gray-50 min-h-[65px]">
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5" />
                <h2 className="font-semibold">Users</h2>
                <span className="ml-auto text-sm text-gray-500">
                  {onlineUsers.length} online
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {otherUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later</p>
                </div>
              ) : (
                <div className="divide-y">
                  {otherUsers.map((chatUser) => (
                    <UserListItem
                      key={chatUser._id}
                      user={chatUser}
                      isOnline={isUserOnline(chatUser._id)}
                      isSelected={selectedUser?._id === chatUser._id}
                      onClick={() => handleUserSelect(chatUser)}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Chat Window - Desktop: always visible, Mobile: shown when user selected */}
          <main className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
            {selectedUser ? (
              <ChatWindow
                selectedUser={selectedUser}
                onBack={handleBackToList}
                showBackButton={showMobileChat}
              />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-full bg-gray-50">
                <div className="bg-white rounded-full p-8 shadow-lg mb-6">
                  <MessageCircle className="w-20 h-20 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Select a user from the list to start chatting
                </p>
                {!isConnected && (
                  <div className="mt-4 flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connecting to chat server...</span>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ChatPage;

