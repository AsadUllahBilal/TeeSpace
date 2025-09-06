"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Mail, 
  MailOpen, 
  Reply, 
  Trash2, 
  Search, 
  Filter,
  Clock,
  Calendar,
  User,
  MessageCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminNotes?: string;
  repliedAt?: string;
  repliedBy?: string;
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

interface StatusCounts {
  new?: number;
  read?: number;
  replied?: number;
}

const AdminInboxPage = () => {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  
  // Selected message for details
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/contact?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages);
      setPagination(data.pagination);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages(1);
    }
  }, [user, statusFilter, searchTerm]);

  const updateMessageStatus = async (id: string, status: string, adminNotes?: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...(adminNotes && { adminNotes }),
          ...(status === 'replied' && { repliedBy: user?.fullName || user?.emailAddresses[0]?.emailAddress })
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update message');
      }

      await fetchMessages(currentPage);
      setIsDetailOpen(false);
      setSelectedMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete message');
      }

      await fetchMessages(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'read': return 'secondary';
      case 'replied': return 'default';
      default: return 'outline';
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
            Please log in to access the admin inbox.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inbox</h1>
          <p className="text-gray-600 mt-1">Manage customer inquiries and messages</p>
        </div>

        {/* Status Overview */}
        <div className="flex gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">New: {statusCounts.new || 0}</span>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <MailOpen className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Read: {statusCounts.read || 0}</span>
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Replied: {statusCounts.replied || 0}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
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

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-500">No contact messages match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow 
                      key={message._id} 
                      className={`hover:bg-gray-50 ${message.status === 'new' ? 'bg-blue-50' : ''}`}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.name}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{message.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(message.status)}>
                          {message.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog 
                            open={isDetailOpen && selectedMessage?._id === message._id}
                            onOpenChange={(open) => {
                              setIsDetailOpen(open);
                              if (open) {
                                setSelectedMessage(message);
                                // Mark as read if it's new
                                if (message.status === 'new') {
                                  updateMessageStatus(message._id, 'read');
                                }
                              } else {
                                setSelectedMessage(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <MessageCircle className="h-5 w-5" />
                                  Message Details
                                </DialogTitle>
                                <DialogDescription>
                                  Contact inquiry from {message.name}
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedMessage && (
                                <MessageDetailView 
                                  message={selectedMessage}
                                  onStatusUpdate={(status, notes) => 
                                    updateMessageStatus(selectedMessage._id, status, notes)
                                  }
                                  isUpdating={updatingStatus}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteMessage(message._id)}
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
            {pagination.total} messages
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                fetchMessages(newPage);
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
                fetchMessages(newPage);
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

// Message Detail Component
interface MessageDetailViewProps {
  message: ContactMessage;
  onStatusUpdate: (status: string, notes?: string) => void;
  isUpdating: boolean;
}

const MessageDetailView: React.FC<MessageDetailViewProps> = ({ 
  message, 
  onStatusUpdate, 
  isUpdating 
}) => {
  const [adminNotes, setAdminNotes] = useState(message.adminNotes || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Message Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{message.name}</span>
            <Badge variant={getStatusBadgeVariant(message.status)}>  
              {message.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(message.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4" />
          {message.email}
        </div>
      </div>

      {/* Subject */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{message.subject}</p>
      </div>

      {/* Message */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Message</h4>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>

      {/* Reply Status */}
      {message.status === 'replied' && message.repliedAt && (
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            Replied on {formatDate(message.repliedAt)}
            {message.repliedBy && ` by ${message.repliedBy}`}
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
        <Textarea
          rows={3}
          placeholder="Add internal notes about this message..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          disabled={isUpdating}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button 
          onClick={() => onStatusUpdate('read', adminNotes)}
          disabled={isUpdating || message.status === 'read'}
          variant="outline"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailOpen className="h-4 w-4" />}
          Mark as Read
        </Button>
        
        <Button 
          onClick={() => onStatusUpdate('replied', adminNotes)}
          disabled={isUpdating || message.status === 'replied'}
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Reply className="h-4 w-4" />}
          Mark as Replied
        </Button>
      </div>
    </div>
  );
};

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'new': return 'destructive';
    case 'read': return 'secondary';
    case 'replied': return 'default';
    default: return 'outline';
  }
}

export default AdminInboxPage;
