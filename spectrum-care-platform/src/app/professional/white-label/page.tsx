'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhiteLabelConfig from '@/components/professional/WhiteLabelConfig';
import {
  ArrowLeft,
  Settings,
  Palette,
  Globe,
  Eye,
  Download,
  Share,
  BarChart3,
  Users,
  Monitor,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Crown,
  Zap
} from 'lucide-react';

export default function WhiteLabelManagementPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  const [error, setError] = useState('');

  useEffect(() => {
    loadWhiteLabelData();
  }, []);

  const loadWhiteLabelData = async () => {
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

      // Check if user is a professional
      if (userData.role !== 'professional') {
        router.push('/dashboard');
        return;
      }

      // Load white label configuration
      const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      };

      const configRes = await fetch('/api/professionals/white-label', { headers });
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData.data);
      }

      // Load analytics stats (simulated)
      setStats({
        totalViews: 1247,
        uniqueVisitors: 892,
        conversionRate: 12.5,
        clientSessions: 156,
        averageSessionTime: '4m 32s',
        popularPages: [
          { page: 'Assessment Booking', views: 456 },
          { page: 'Client Portal', views: 334 },
          { page: 'Reports Library', views: 289 }
        ]
      });

    } catch (error) {
      console.error('Failed to load white label data:', error);
      setError('Failed to load white label configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSave = (newConfig: any) => {
    setConfig(newConfig);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generatePreviewUrl = () => {
    if (!config) return '';
    const domain = config.customDomain || 'yourpractice.spectrumcare.platform';
    return `https://${domain}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`${config?.whiteLabelEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">White Label Status</p>
                <p className={`text-2xl font-bold ${config?.whiteLabelEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                  {config?.whiteLabelEnabled ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-3 rounded-full ${config?.whiteLabelEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                {config?.whiteLabelEnabled ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custom Domain</p>
                <p className="text-lg font-semibold text-gray-900">
                  {config?.customDomain ? 'Configured' : 'Not Set'}
                </p>
                {config?.customDomain && (
                  <p className="text-sm text-gray-500 truncate">{config.customDomain}</p>
                )}
              </div>
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Brand Setup</p>
                <p className="text-lg font-semibold text-gray-900">
                  {config?.brandName ? 'Complete' : 'Pending'}
                </p>
                {config?.brandName && (
                  <p className="text-sm text-gray-500">{config.brandName}</p>
                )}
              </div>
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your professional brand and client portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex-col space-y-2"
              onClick={() => setActiveTab('configuration')}
            >
              <Settings className="h-6 w-6" />
              <span>Configure Brand</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => window.open(generatePreviewUrl(), '_blank')}
            >
              <Eye className="h-6 w-6" />
              <span>Preview Portal</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => setActiveTab('resources')}
            >
              <Download className="h-6 w-6" />
              <span>Download Assets</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Configuration Preview */}
      {config?.whiteLabelEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>
              Preview of your current white label setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Brand Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand Name:</span>
                      <span className="font-medium">{config.brandName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tagline:</span>
                      <span className="font-medium">{config.brandTagline || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domain:</span>
                      <span className="font-medium">{config.customDomain || 'Default subdomain'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Active Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(config.features || {}).map(([feature, enabled]) =>
                      enabled ? (
                        <Badge key={feature} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {feature.replace(/([A-Z])/g, ' $1').trim()}
                        </Badge>
                      ) : null
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Portal URL</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={generatePreviewUrl()}
                      readOnly
                      className="flex-1 p-2 border rounded text-sm bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatePreviewUrl())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(generatePreviewUrl(), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Color Scheme</h4>
                  <div className="flex gap-2">
                    {config.brandColors && Object.entries(config.brandColors).slice(0, 5).map(([key, color]) => (
                      <div key={key} className="text-center">
                        <div
                          className="w-8 h-8 rounded border shadow-sm"
                          style={{ backgroundColor: color as string }}
                        />
                        <p className="text-xs mt-1 capitalize">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalViews}</p>
                <p className="text-sm text-gray-500">+12% this month</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-3xl font-bold text-green-600">{stats.uniqueVisitors}</p>
                <p className="text-sm text-gray-500">+8% this month</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-purple-600">{stats.conversionRate}%</p>
                <p className="text-sm text-gray-500">+2.1% this month</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Session</p>
                <p className="text-3xl font-bold text-orange-600">{stats.averageSessionTime}</p>
                <p className="text-sm text-gray-500">+15s this month</p>
              </div>
              <Monitor className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Pages</CardTitle>
          <CardDescription>
            Most visited pages on your client portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularPages?.map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{page.page}</p>
                  <p className="text-sm text-gray-600">{page.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{Math.round((page.views / stats.totalViews) * 100)}%</p>
                  <p className="text-xs text-gray-500">of total traffic</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketing Materials</CardTitle>
          <CardDescription>
            Download branded materials for your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Business Cards</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Letterhead</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Brochures</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Email Templates</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Social Media Kit</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span>Client Handouts</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guides</CardTitle>
          <CardDescription>
            Documentation and guides for your white label portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Custom Domain Setup Guide</h4>
                <p className="text-sm text-gray-600">Step-by-step instructions for DNS configuration</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Brand Guidelines</h4>
                <p className="text-sm text-gray-600">Best practices for maintaining brand consistency</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Client Portal Training</h4>
                <p className="text-sm text-gray-600">How to train clients to use your branded portal</p>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading white label configuration...</p>
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
                  <Crown className="h-8 w-8 mr-3 text-purple-600" />
                  White Label Management
                </h1>
                <p className="text-gray-600 mt-1">Customize your professional brand and client portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="h-3 w-3 mr-1" />
                Professional Plan
              </Badge>
              {config?.whiteLabelEnabled && (
                <Button onClick={() => window.open(generatePreviewUrl(), '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Portal
                </Button>
              )}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="configuration">
            <Card>
              <CardHeader>
                <CardTitle>White Label Configuration</CardTitle>
                <CardDescription>
                  Customize your brand appearance and client portal settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config && (
                  <WhiteLabelConfig
                    initialConfig={config}
                    onSave={handleConfigSave}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            {renderAnalytics()}
          </TabsContent>

          <TabsContent value="resources">
            {renderResources()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
