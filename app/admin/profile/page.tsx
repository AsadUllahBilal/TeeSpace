"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  Lock, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Crown,
  Clock,
  Key,
  Smartphone,
  Monitor,
  RefreshCw,
  LogOut,
  Download,
  Upload,
  Camera,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

interface ProfileData {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  clerkData: {
    firstName?: string;
    lastName?: string;
    primaryEmailAddress?: string;
    imageUrl?: string;
    lastSignInAt?: number;
    createdAt?: number;
    updatedAt?: number;
    twoFactorEnabled?: boolean;
    backupCodeEnabled?: boolean;
    totpEnabled?: boolean;
    emailAddresses?: any[];
    phoneNumbers?: any[];
  };
}

const AdminProfilePage = () => {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicForm, setBasicForm] = useState({
    fullName: '',
    username: '',
    firstName: '',
    lastName: ''
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    backupCodeEnabled: false,
    totpEnabled: false
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/api/profile');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      
      // Enhance profile data with client-side Clerk information
      const enhancedProfile = {
        ...data.profile,
        clerkData: {
          ...data.profile.clerkData,
          firstName: user?.firstName || data.profile.clerkData?.firstName || '',
          lastName: user?.lastName || data.profile.clerkData?.lastName || '',
          imageUrl: user?.imageUrl || data.profile.clerkData?.imageUrl || data.profile.avatarUrl,
          primaryEmailAddress: user?.primaryEmailAddress?.emailAddress || data.profile.clerkData?.primaryEmailAddress || data.profile.email,
          lastSignInAt: user?.lastSignInAt || data.profile.clerkData?.lastSignInAt || Date.now(),
          twoFactorEnabled: user?.twoFactorEnabled || data.profile.clerkData?.twoFactorEnabled || false,
          backupCodeEnabled: user?.backupCodeEnabled || data.profile.clerkData?.backupCodeEnabled || false,
          totpEnabled: user?.totpEnabled || data.profile.clerkData?.totpEnabled || false,
          emailAddresses: data.profile.clerkData?.emailAddresses || [],
          phoneNumbers: data.profile.clerkData?.phoneNumbers || [],
        }
      };
      
      setProfile(enhancedProfile);
      
      // Initialize form with current data
      setBasicForm({
        fullName: enhancedProfile.fullName || '',
        username: enhancedProfile.username || '',
        firstName: enhancedProfile.clerkData.firstName || '',
        lastName: enhancedProfile.clerkData.lastName || ''
      });
      
      // Initialize security settings
      setSecuritySettings({
        twoFactorEnabled: enhancedProfile.clerkData.twoFactorEnabled || false,
        backupCodeEnabled: enhancedProfile.clerkData.backupCodeEnabled || false,
        totpEnabled: enhancedProfile.clerkData.totpEnabled || false
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updateData: any) => {
    try {
      setSaving(true);
      setError('');
      const response = await fetch('/admin/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
      setEditingBasic(false);
      await fetchProfile(); // Refresh data
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSecurityAction = async (action: string) => {
    try {
      setSaving(true);
      setError('');
      const response = await fetch('/admin/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to perform action');
      }

      const data = await response.json();
      setSuccess(data.message);
      
      if (action === 'refresh_sessions') {
        setSessions(data.sessions || []);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
    } finally {
      setSaving(false);
    }
  };

  const refreshSessions = async () => {
    setLoadingSessions(true);
    await handleSecurityAction('refresh_sessions');
    setLoadingSessions(false);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access your profile.
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and security settings</p>
        </div>
        <Badge variant="default" className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          Administrator
        </Badge>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (editingBasic) {
                          setEditingBasic(false);
                          // Reset form
                          setBasicForm({
                            fullName: profile.fullName || '',
                            username: profile.username || '',
                            firstName: profile.clerkData.firstName || '',
                            lastName: profile.clerkData.lastName || ''
                          });
                        } else {
                          setEditingBasic(true);
                        }
                      }}
                    >
                      {editingBasic ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingBasic ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={basicForm.firstName}
                            onChange={(e) => setBasicForm(prev => ({ ...prev, firstName: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={basicForm.lastName}
                            onChange={(e) => setBasicForm(prev => ({ ...prev, lastName: e.target.value }))}
                            disabled={saving}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={basicForm.fullName}
                          onChange={(e) => setBasicForm(prev => ({ ...prev, fullName: e.target.value }))}
                          disabled={saving}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={basicForm.username}
                          onChange={(e) => setBasicForm(prev => ({ ...prev, username: e.target.value }))}
                          disabled={saving}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button
                          onClick={() => updateProfile(basicForm)}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">First Name</Label>
                          <p className="text-sm">{profile.clerkData.firstName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                          <p className="text-sm">{profile.clerkData.lastName || 'Not set'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="text-sm">{profile.fullName || 'Not set'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Username</Label>
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{profile.username}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <p className="text-sm">{profile.email}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and authentication methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Two-Factor Authentication</span>
                        {securitySettings.twoFactorEnabled && (
                          <Badge variant="default" className="text-xs">Enabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      disabled={true} // Managed by Clerk
                    />
                  </div>

                  <Separator />

                  {/* TOTP */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Authenticator App</span>
                        {securitySettings.totpEnabled && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Use an authenticator app for secure login codes
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Configure
                    </Button>
                  </div>

                  <Separator />

                  {/* Backup Codes */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Backup Codes</span>
                        {securitySettings.backupCodeEnabled && (
                          <Badge variant="default" className="text-xs">Generated</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Generate backup codes for account recovery
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSecurityAction('generate_backup_codes')}
                      disabled={saving}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>

                  <Separator />

                  {/* Password */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Password</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Change your account password
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity & Sessions */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Sessions</CardTitle>
                      <CardDescription>Manage your active login sessions</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshSessions}
                      disabled={loadingSessions}
                    >
                      {loadingSessions ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Current Session */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Monitor className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-500">This device • Just now</p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>

                    {/* Other Sessions */}
                    {sessions.length > 0 ? (
                      sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                              <Monitor className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">Browser Session</p>
                              <p className="text-sm text-gray-500">Unknown location • {formatDate(session.createdAt)}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <LogOut className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No other active sessions found
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent account activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border-l-4 border-blue-200 bg-blue-50">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-gray-500">{formatDate(profile.updatedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 border-l-4 border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Security settings reviewed</p>
                        <p className="text-xs text-gray-500">{formatDate(profile.clerkData.lastSignInAt || Date.now())}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border-l-4 border-gray-200 bg-gray-50">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Account created</p>
                        <p className="text-xs text-gray-500">{formatDate(profile.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={profile.avatarUrl || profile.clerkData.imageUrl}
                      alt={profile.fullName}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(profile.fullName || profile.email)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 rounded-full"
                    disabled
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold">{profile.fullName}</h3>
                  <p className="text-sm text-gray-500">@{profile.username}</p>
                  <Badge variant="default" className="mt-1">
                    {profile.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Last active {formatDate(profile.clerkData.lastSignInAt || Date.now())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Update Avatar
              </Button>
              
              <Button variant="outline" className="w-full justify-start" disabled>
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSecurityAction('generate_backup_codes')}
                disabled={saving}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Backup Codes
              </Button>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Profile Completion</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Security Score</span>
                <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                  {securitySettings.twoFactorEnabled ? "High" : "Medium"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Password Change</span>
                <span className="text-sm font-medium">Never</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
