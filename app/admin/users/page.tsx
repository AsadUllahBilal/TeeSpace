"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Users, 
  User as UserIcon,
  Search,
  Calendar,
  Mail,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Crown,
  Clock,
  UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';

interface UserType {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface RoleCounts {
  admin?: number;
  user?: number;
}

const AdminUsersPage = () => {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({});
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  
  // Selected user for details
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/admin/api/users?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      setRoleCounts(data.roleCounts || {});
      setTotalUsersCount(data.totalUsersCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers(1);
    }
  }, [user, roleFilter, searchTerm]);

  const updateUserRole = async (id: string, role: string, fullName?: string) => {
    try {
      setUpdatingUser(true);
      const response = await fetch(`/admin/api/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: id,
          role,
          ...(fullName && { fullName })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user');
      }

      await fetchUsers(currentPage);
      setIsDetailOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setUpdatingUser(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/admin/api/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await fetchUsers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'user': return <UserIcon className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>

        {/* User Stats */}
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-right">
                <div className="text-sm font-medium">Total Users</div>
                <div className="text-xs text-gray-500">{totalUsersCount}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">Admins</div>
              <div className="text-xs text-gray-500">{roleCounts.admin || 0}</div>
            </div>
          </div>
        </Card>
        <Card className="px-4 py-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">Regular Users</div>
              <div className="text-xs text-gray-500">{roleCounts.user || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name, email, username..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">No users match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow 
                      key={userItem._id} 
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {userItem.avatarUrl ? (
                              <Image 
                                src={userItem.avatarUrl} 
                                alt={userItem.fullName}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{userItem.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              {getRoleIcon(userItem.role)}
                              {userItem.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{userItem.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {userItem.username}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(userItem.role)} className="capitalize">
                          {userItem.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(userItem.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog 
                            open={isDetailOpen && selectedUser?._id === userItem._id}
                            onOpenChange={(open) => {
                              setIsDetailOpen(open);
                              if (open) {
                                setSelectedUser(userItem);
                              } else {
                                setSelectedUser(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <UserCog className="h-5 w-5" />
                                  User Details - {userItem.fullName}
                                </DialogTitle>
                                <DialogDescription>
                                  Manage user information and role
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedUser && (
                                <UserDetailView 
                                  user={selectedUser}
                                  onUserUpdate={(role, fullName) => 
                                    updateUserRole(selectedUser._id, role, fullName)
                                  }
                                  isUpdating={updatingUser}
                                  currentUserId={user?.id}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteUser(userItem._id)}
                            disabled={userItem.clerkId === user?.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                fetchUsers(newPage);
              }}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                fetchUsers(newPage);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// User Detail Component
interface UserDetailViewProps {
  user: UserType;
  onUserUpdate: (role: string, fullName?: string) => void;
  isUpdating: boolean;
  currentUserId?: string;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ 
  user, 
  onUserUpdate, 
  isUpdating,
  currentUserId 
}) => {
  const [newRole, setNewRole] = useState(user.role);
  const [fullName, setFullName] = useState(user.fullName);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const isOwnAccount = user.clerkId === currentUserId;

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              User Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl} 
                      alt={user.fullName}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </div>
              </div>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Clerk ID:</span> {user.clerkId}</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">Role:</span>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Account Details
            </h4>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <p><span className="font-medium">Account Created:</span> {formatDate(user.createdAt)}</p>
              <p><span className="font-medium">Last Updated:</span> {formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      {!isOwnAccount && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900">User Management</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <Select value={newRole} onValueChange={setNewRole} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Regular User</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => onUserUpdate(newRole, fullName)}
              disabled={isUpdating || (newRole === user.role && fullName === user.fullName)}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {isOwnAccount && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">This is your own account</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            You cannot modify your own role or delete your account from this interface.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
