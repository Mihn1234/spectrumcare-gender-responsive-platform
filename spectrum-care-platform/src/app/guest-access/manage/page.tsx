'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Plus,
  Eye,
  Clock,
  Users,
  Mail,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings,
  Globe,
  Key,
  History,
  Bell,
  FileText
} from 'lucide-react';

interface GuestAccessRecord {
  id: string;
  professionalEmail: string;
  professionalName: string;
  organization: string;
  caseId: string;
  caseType: string;
  accessPurpose: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired' | 'pending_approval';
  permissions: any;
  expiresAt: string;
  createdAt: string;
  lastActivity?: string;
  usedAt?: string;
  activityLog: any[];
}

export default function GuestAccessManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [guestAccess, setGuestAccess] = useState<GuestAccessRecord[]>([]);
  const [filteredAccess, setFilteredAccess] = useState<GuestAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    caseType: 'all',
    search: ''
  });

  const [newAccess, setNewAccess] = useState({
    professionalEmail: '',
    professionalName: '',
    organization: '',
    caseId: '',
    caseType: 'child',
    accessPurpose: '',
    expiresInDays: 30,
    permissions: {
      canViewDocuments: true,
      canUploadDocuments: false,
      canViewAssessments: true,
      canCreateAssessments: false,
      canViewReviews: true,
      canParticipateReviews: false,
      canViewChildProfile: true,
      canViewContactDetails: false,
      canGenerateReports: false,
      canAccessAiAnalysis: false
    },
    notifyParent: true
  });

  useEffect(() => {
    loadGuestAccessData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [guestAccess, filters]);

  const loadGuestAccessData = async () => {
    try {
      setLoading(true);

      // Get user from localStorage
      const storedUser = localStorage.getItem('userData');
      const authToken = localStorage.getItem('authToken');

      if (!storedUser || !authToken) {
        router.push('/auth/login');
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Check if user is LA officer
      if (userData.role !== 'la_officer' && userData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      // Load guest access records
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      const guestRes = await fetch('/api/guest-access', { headers });
      if (guestRes.ok) {
        const guestData = await guestRes.json();

        // Enrich with demo data
        const enrichedRecords = (guestData.data || []).map((record: any) => ({
          ...record,
          isExpired: new Date(record.expiresAt) < new Date(),
          isActive: record.status === 'active' && new Date(record.expiresAt) >= new Date(),
          daysSinceCreated: Math.floor((Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
          daysUntilExpiry: Math.ceil((new Date(record.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }));

        setGuestAccess(enrichedRecords);
      }

    } catch (error) {
      console.error('Failed to load guest access data:', error);
      setError('Failed to load guest access data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...guestAccess];

    if (filters.status !== 'all') {
      if (filters.status === 'expired') {
        filtered = filtered.filter(access => new Date(access.expiresAt) < new Date());
      } else {
        filtered = filtered.filter(access => access.status === filters.status);
      }
    }

    if (filters.caseType !== 'all') {
      filtered = filtered.filter(access => access.caseType === filters.caseType);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(access =>
        access.professionalEmail.toLowerCase().includes(searchTerm) ||
        access.professionalName.toLowerCase().includes(searchTerm) ||
        access.organization.toLowerCase().includes(searchTerm) ||
        access.accessPurpose.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredAccess(filtered);
  };

  const createGuestAccess = async () => {
    try {
      setCreating(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/guest-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAccess)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Guest access created successfully! Invitation email has been sent.');
        setShowCreateForm(false);
        await loadGuestAccessData();

        // Reset form
        setNewAccess({
          professionalEmail: '',
          professionalName: '',
          organization: '',
          caseId: '',
          caseType: 'child',
          accessPurpose: '',
          expiresInDays: 30,
          permissions: {
            canViewDocuments: true,
            canUploadDocuments: false,
            canViewAssessments: true,
            canCreateAssessments: false,
            canViewReviews: true,
            canParticipateReviews: false,
            canViewChildProfile: true,
            canViewContactDetails: false,
            canGenerateReports: false,
            canAccessAiAnalysis: false
          },
          notifyParent: true
        });
      } else {
        throw new Error(result.error || 'Failed to create guest access');
      }

    } catch (error) {
      console.error('Error creating guest access:', error);
      setError(error instanceof Error ? error.message : 'Failed to create guest access');
    } finally {
      setCreating(false);
    }
  };

  const updateAccessStatus = async (accessId: string, status: string, reason?: string) => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/guest-access', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guestAccessId: accessId,
          data: { status, revocationReason: reason }
        })
      });

      if (response.ok) {
        setSuccess(`Access ${status} successfully`);
        await loadGuestAccessData();
      } else {
        throw new Error('Failed to update access status');
      }

    } catch (error) {
      console.error('Error updating access status:', error);
      setError('Failed to update access status');
    }
  };

  const getStatusColor = (status: string, isExpired?: boolean) => {
    if (isExpired) return 'bg-gray-100 text-gray-800';

    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'pending_approval': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, isExpired?: boolean) => {
    if (isExpired) return Clock;

    switch (status) {
      case 'active': return CheckCircle;
      case 'suspended': return AlertTriangle;
      case 'revoked': return XCircle;
      case 'pending_approval': return Clock;
      default: return AlertTriangle;
    }
  };

  const renderOverview = () => {
    const stats = {
      total: guestAccess.length,
      active: guestAccess.filter(a => a.status === 'active' && new Date(a.expiresAt) >= new Date()).length,
      expired: guestAccess.filter(a => new Date(a.expiresAt) < new Date()).length,
      unused: guestAccess.filter(a => !a.usedAt).length,
      expiringThisWeek: guestAccess.filter(a => {
        const daysUntil = Math.ceil((new Date(a.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil > 0;
      }).length
    };

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Access</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.expired}</p>
                </div>
                <Clock className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unused</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.unused}</p>
                </div>
                <Key className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-red-600">{stats.expiringThisWeek}</p>
                </div>
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage external professional access to your cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className="h-20 flex-col space-y-2"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-6 w-6" />
                <span>Create Guest Access</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => setActiveTab('active')}
              >
                <Users className="h-6 w-6" />
                <span>View Active Access</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => setActiveTab('expired')}
              >
                <Clock className="h-6 w-6" />
                <span>Review Expired</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2"
                onClick={() => loadGuestAccessData()}
              >
                <RefreshCw className="h-6 w-6" />
                <span>Refresh Data</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Guest Access</CardTitle>
            <CardDescription>
              Latest external professional access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guestAccess.slice(0, 5).map((access) => {
                const StatusIcon = getStatusIcon(access.status, new Date(access.expiresAt) < new Date());
                return (
                  <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <StatusIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{access.professionalName}</h4>
                        <p className="text-sm text-gray-600">{access.professionalEmail}</p>
                        <p className="text-xs text-gray-500">{access.organization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(access.status, new Date(access.expiresAt) < new Date())}>
                        {new Date(access.expiresAt) < new Date() ? 'Expired' : access.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Case: {access.caseId}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAccessList = (statusFilter?: string) => {
    let displayAccess = filteredAccess;

    if (statusFilter) {
      if (statusFilter === 'expired') {
        displayAccess = filteredAccess.filter(access => new Date(access.expiresAt) < new Date());
      } else {
        displayAccess = filteredAccess.filter(access => access.status === statusFilter);
      }
    }

    return (
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search by email, name, or organization..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.caseType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, caseType: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Case Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="child">Child Cases</SelectItem>
                  <SelectItem value="adult">Adult Cases</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Access Records */}
        <div className="space-y-4">
          {displayAccess.map((access) => {
            const StatusIcon = getStatusIcon(access.status, new Date(access.expiresAt) < new Date());
            const isExpired = new Date(access.expiresAt) < new Date();
            const isActive = access.status === 'active' && !isExpired;

            return (
              <Card key={access.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <StatusIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{access.professionalName}</h3>
                          <Badge className={getStatusColor(access.status, isExpired)}>
                            {isExpired ? 'Expired' : access.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Email:</strong> {access.professionalEmail}</p>
                            <p><strong>Organization:</strong> {access.organization}</p>
                            <p><strong>Case ID:</strong> {access.caseId} ({access.caseType})</p>
                          </div>
                          <div>
                            <p><strong>Purpose:</strong> {access.accessPurpose}</p>
                            <p><strong>Created:</strong> {new Date(access.createdAt).toLocaleDateString()}</p>
                            <p><strong>Expires:</strong> {new Date(access.expiresAt).toLocaleDateString()}</p>
                            {access.lastActivity && (
                              <p><strong>Last Activity:</strong> {new Date(access.lastActivity).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(access.permissions || {}).map(([key, value]) =>
                              value ? (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                              ) : null
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isActive && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateAccessStatus(access.id, 'suspended')}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateAccessStatus(access.id, 'revoked', 'Revoked by administrator')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {access.status === 'suspended' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAccessStatus(access.id, 'active')}
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {displayAccess.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No guest access found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Create your first guest access invitation'
                }
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Guest Access
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderCreateForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Create Guest Access</CardTitle>
        <CardDescription>
          Invite an external professional to access specific case information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="professionalEmail">Professional Email *</Label>
            <Input
              id="professionalEmail"
              type="email"
              value={newAccess.professionalEmail}
              onChange={(e) => setNewAccess(prev => ({ ...prev, professionalEmail: e.target.value }))}
              placeholder="professional@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="professionalName">Professional Name *</Label>
            <Input
              id="professionalName"
              value={newAccess.professionalName}
              onChange={(e) => setNewAccess(prev => ({ ...prev, professionalName: e.target.value }))}
              placeholder="Dr. Jane Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={newAccess.organization}
              onChange={(e) => setNewAccess(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="Independent Psychology Practice"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caseId">Case ID *</Label>
            <Input
              id="caseId"
              value={newAccess.caseId}
              onChange={(e) => setNewAccess(prev => ({ ...prev, caseId: e.target.value }))}
              placeholder="Enter case/child ID"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="caseType">Case Type</Label>
            <Select
              value={newAccess.caseType}
              onValueChange={(value) => setNewAccess(prev => ({ ...prev, caseType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="child">Child Case</SelectItem>
                <SelectItem value="adult">Adult Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresInDays">Access Duration (Days)</Label>
            <Select
              value={newAccess.expiresInDays.toString()}
              onValueChange={(value) => setNewAccess(prev => ({ ...prev, expiresInDays: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessPurpose">Access Purpose *</Label>
          <Textarea
            id="accessPurpose"
            value={newAccess.accessPurpose}
            onChange={(e) => setNewAccess(prev => ({ ...prev, accessPurpose: e.target.value }))}
            placeholder="Describe the purpose of this access request..."
            rows={3}
          />
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <Label>Permissions</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(newAccess.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={Boolean(value)}
                  onCheckedChange={(checked) => setNewAccess(prev => ({
                    ...prev,
                    permissions: { ...prev.permissions, [key]: checked }
                  }))}
                />
                <Label htmlFor={key} className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="notifyParent"
            checked={newAccess.notifyParent}
            onCheckedChange={(checked) => setNewAccess(prev => ({ ...prev, notifyParent: checked }))}
          />
          <Label htmlFor="notifyParent">Notify parent/guardian of this access</Label>
        </div>

        <div className="flex space-x-4">
          <Button onClick={createGuestAccess} disabled={creating}>
            {creating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Guest Access
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading guest access management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-blue-600" />
                  Guest Access Management
                </h1>
                <p className="text-gray-600 mt-1">Manage external professional access to case information</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="h-3 w-3 mr-1" />
                Secure Access
              </Badge>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Access
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {showCreateForm ? (
          renderCreateForm()
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="all">All Access</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="all">
              {renderAccessList()}
            </TabsContent>

            <TabsContent value="active">
              {renderAccessList('active')}
            </TabsContent>

            <TabsContent value="expired">
              {renderAccessList('expired')}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
