'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '../../components/AdminRoute';
import { UserCard } from '../../components/admin/UserCard';
import { Button, ConfirmDialog } from '../../components/ui';
import { useAppSelector, useAppDispatch } from '../../lib/store/hooks';
import { useGetAllUsersQuery, useDeleteUserMutation } from '../../lib/store/api/usersApi';
import { logoutUser } from '../../lib/store/thunks/authThunks';
import { 
  Users, 
  LogOut, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: usersData, isLoading, error, refetch } = useGetAllUsersQuery({ page, limit });
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    userId: null,
    userName: null,
  });

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.userId) return;

    try {
      await deleteUser(deleteConfirmation.userId).unwrap();
      toast.success('User deleted successfully');
      setDeleteConfirmation({ isOpen: false, userId: null, userName: null });
      refetch();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load users</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AdminRoute>
    );
  }

  const users = usersData?.data.items || [];
  const pagination = usersData?.data.pagination;

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage users and system settings</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/posts')}
                >
                  View Posts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination?.total || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Page</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination?.page || 1}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Filter className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pages</p>
                  <p className="text-3xl font-bold text-gray-900">{pagination?.totalPages || 1}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Search className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                All Users ({pagination?.total || 0})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </Button>
            </div>

            {users.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {users.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
                      currentUserId={currentUser?._id}
                      onDelete={(userId) => {
                        const userName = user.name || user.email;
                        handleDeleteClick(userId, userName);
                      }}
                    />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * limit) + 1} to{' '}
                      {Math.min(pagination.page * limit, pagination.total)} of{' '}
                      {pagination.total} users
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!pagination.hasPrev}
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter(p => {
                            return p === 1 || 
                                   p === pagination.totalPages || 
                                   (p >= page - 1 && p <= page + 1);
                          })
                          .map((p, index, array) => (
                            <React.Fragment key={p}>
                              {index > 0 && array[index - 1] !== p - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  p === page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                }`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNext}
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">There are no users in the system yet.</p>
              </div>
            )}
          </div>
        </main>

        <ConfirmDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, userId: null, userName: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteConfirmation.userName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isDeleting}
          variant="danger"
        />
      </div>
    </AdminRoute>
  );
};

export default DashboardPage;
