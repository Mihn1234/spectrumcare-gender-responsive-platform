'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  UserCog,
  Shield,
  Building,
  Crown,
  Stethoscope,
  Code,
  LogIn,
  RefreshCw,
  Database,
  Eye,
  Settings,
  Zap,
  Users,
  FileText,
  Monitor
} from 'lucide-react';

interface DevUser {
  type: string;
  name: string;
  email: string;
  role: string;
  portal: string;
  description: string;
}

export default function DevPage() {
  const router = useRouter();
  const [users, setUsers] = useState<DevUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    loadSystemStatus();
    loadAvailableUsers();
    checkCurrentUser();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/dev/bypass?action=status');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await fetch('/api/dev/bypass?action=users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const checkCurrentUser = () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Decode token to get user info (simplified)
      try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        setCurrentUser({
          id: payload.userId,
          role: payload.role
        });
      } catch (error) {
        console.log('No valid token found');
      }
    }
  };

  const handleLogin = async (userType: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/dev/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          userType
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Successfully logged in as ${userType}`);

        // Store token in localStorage for the frontend
        if (data.user) {
          localStorage.setItem('authToken', 'dev-bypass-token');
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          setCurrentUser(data.user);
        }

        // Redirect to appropriate portal
        setTimeout(() => {
          router.push(data.redirectTo);
        }, 1500);
      } else {
        setMessage(`❌ Login failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestData = async (userType: string) => {
    try {
      const response = await fetch('/api/dev/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_test_data',
          userType
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Test data created for ${userType}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to create test data`);
    }
  };

  const getUserIcon = (role: string) => {
    switch (role) {
      case 'parent': return <User className="h-5 w-5" />;
      case 'professional': return <Stethoscope className="h-5 w-5" />;
      case 'admin': return <Shield className="h-5 w-5" />;
      case 'la-officer': return <Building className="h-5 w-5" />;
      default: return <UserCog className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'la-officer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setMessage('✅ Logged out successfully');
  };

  const handleQuickAccess = (path: string) => {
    router.push(path);
  };

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Development tools are not available in production.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Code className="h-8 w-8 mr-3 text-blue-600" />
                SpectrumCare - Development Portal
              </h1>
              <p className="text-gray-600 mt-2">Easy portal testing with multiple user types</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-orange-100 text-orange-800">
                Development Mode
              </Badge>
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(currentUser.role)}>
                    Current: {currentUser.role}
                  </Badge>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        {systemStatus && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {systemStatus.available ? '✅' : '❌'}
                  </p>
                  <p className="text-sm text-gray-600">Dev Bypass</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{systemStatus.users?.length || 0}</p>
                  <p className="text-sm text-gray-600">User Types</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{systemStatus.environment}</p>
                  <p className="text-sm text-gray-600">Environment</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">🚀</p>
                  <p className="text-sm text-gray-600">Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message Display */}
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Quick Access Panel */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Quick Access
            </CardTitle>
            <CardDescription>Jump directly to different platform areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('/dashboard')}
                className="flex items-center space-x-2"
              >
                <Monitor className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('/professional/white-label')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Professional</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('/guest-access/manage')}
                className="flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Guest Access</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAccess('/community-support')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.type} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getUserIcon(user.role)}
                    <span>{user.name}</span>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                </CardTitle>
                <CardDescription>{user.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Portal:</p>
                    <p className="text-sm font-medium">{user.portal}</p>
                  </div>

                  <Separator />

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleLogin(user.type)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LogIn className="h-4 w-4 mr-2" />
                      )}
                      Login
                    </Button>

                    <Button
                      onClick={() => handleCreateTestData(user.type)}
                      variant="outline"
                      size="sm"
                    >
                      <Database className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Development Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Development Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Available User Types:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Parent:</strong> Full family portal access</li>
                  <li>• <strong>Professional:</strong> Practice management tools</li>
                  <li>• <strong>Admin:</strong> System administration</li>
                  <li>• <strong>LA Officer:</strong> Local authority functions</li>
                  <li>• <strong>Premium Parent:</strong> Advanced features</li>
                  <li>• <strong>Therapist:</strong> Specialist tools</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Testing Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Automatic test data creation</li>
                  <li>• JWT token authentication</li>
                  <li>• Portal-specific redirects</li>
                  <li>• Role-based feature access</li>
                  <li>• Quick portal switching</li>
                  <li>• Session persistence</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
