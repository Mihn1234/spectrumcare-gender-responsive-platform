'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Eye,
  Upload,
  Palette,
  Globe,
  Save,
  Download,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface WhiteLabelConfigProps {
  professionalId?: string;
  initialConfig?: any;
  onSave?: (config: any) => void;
}

export default function WhiteLabelConfig({
  professionalId,
  initialConfig,
  onSave
}: WhiteLabelConfigProps) {
  const [config, setConfig] = useState({
    whiteLabelEnabled: initialConfig?.whiteLabelEnabled || false,
    brandName: initialConfig?.brandName || '',
    brandTagline: initialConfig?.brandTagline || '',
    brandLogoUrl: initialConfig?.brandLogoUrl || '',
    brandFaviconUrl: initialConfig?.brandFaviconUrl || '',
    brandColors: initialConfig?.brandColors || {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#10b981',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      muted: '#f8fafc',
      destructive: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e'
    },
    customDomain: initialConfig?.customDomain || '',
    contactInfo: initialConfig?.contactInfo || {
      phone: '',
      email: '',
      address: '',
      website: ''
    },
    socialMedia: initialConfig?.socialMedia || {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: ''
    },
    customCSS: initialConfig?.customCSS || '',
    emailTemplates: initialConfig?.emailTemplates || {
      welcome: '',
      appointment: '',
      report: '',
      reminder: ''
    },
    features: initialConfig?.features || {
      clientPortal: true,
      onlineBooking: true,
      documentSharing: true,
      messaging: true,
      reports: true,
      payments: false
    },
    settings: initialConfig?.settings || {
      timezone: 'Europe/London',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'GBP',
      language: 'en'
    }
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('branding');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/professionals/white-label`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSuccess('White label configuration saved successfully!');

      if (onSave) {
        onSave(config);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simulate file upload - in real implementation, this would upload to cloud storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === 'logo') {
        setConfig(prev => ({ ...prev, brandLogoUrl: dataUrl }));
      } else {
        setConfig(prev => ({ ...prev, brandFaviconUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const generatePreviewUrl = () => {
    const domain = config.customDomain || 'yourpractice.spectrumcare.platform';
    return `https://${domain}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const renderColorPicker = (colorKey: string, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={colorKey}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={colorKey}
          type="color"
          value={config.brandColors[colorKey]}
          onChange={(e) => setConfig(prev => ({
            ...prev,
            brandColors: { ...prev.brandColors, [colorKey]: e.target.value }
          }))}
          className="w-16 h-10 p-1 border rounded cursor-pointer"
        />
        <Input
          value={config.brandColors[colorKey]}
          onChange={(e) => setConfig(prev => ({
            ...prev,
            brandColors: { ...prev.brandColors, [colorKey]: e.target.value }
          }))}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
    </div>
  );

  const renderPreview = () => {
    const previewStyle = {
      backgroundColor: config.brandColors.background,
      color: config.brandColors.text,
      borderColor: config.brandColors.border,
    };

    const buttonStyle = {
      backgroundColor: config.brandColors.primary,
      color: config.brandColors.background,
    };

    return (
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <div className="bg-gray-800 p-2 flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-white text-sm">
            {generatePreviewUrl()}
          </div>
        </div>

        <div
          className={`p-6 ${previewMode === 'mobile' ? 'max-w-sm' : previewMode === 'tablet' ? 'max-w-2xl' : 'w-full'}`}
          style={previewStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottomColor: config.brandColors.border, borderBottomWidth: '1px' }}>
            <div className="flex items-center gap-3">
              {config.brandLogoUrl && (
                <img
                  src={config.brandLogoUrl}
                  alt="Brand logo"
                  className="w-12 h-12 object-contain rounded"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {config.brandName || 'Your Practice Name'}
                </h1>
                {config.brandTagline && (
                  <p className="text-sm opacity-75">{config.brandTagline}</p>
                )}
              </div>
            </div>
            <Badge
              style={{
                backgroundColor: config.brandColors.accent,
                color: config.brandColors.background
              }}
            >
              Professional Portal
            </Badge>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6">
            <Button size="sm" style={buttonStyle}>Dashboard</Button>
            <Button size="sm" variant="outline" style={{ borderColor: config.brandColors.border }}>
              Appointments
            </Button>
            <Button size="sm" variant="outline" style={{ borderColor: config.brandColors.border }}>
              Reports
            </Button>
            <Button size="sm" variant="outline" style={{ borderColor: config.brandColors.border }}>
              Messages
            </Button>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card style={{ backgroundColor: config.brandColors.muted, borderColor: config.brandColors.border }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Recent Assessments</h3>
                <p className="text-sm opacity-75">3 completed this week</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: config.brandColors.muted, borderColor: config.brandColors.border }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Upcoming Reviews</h3>
                <p className="text-sm opacity-75">2 scheduled this month</p>
              </CardContent>
            </Card>
            <Card style={{ backgroundColor: config.brandColors.muted, borderColor: config.brandColors.border }}>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Client Messages</h3>
                <p className="text-sm opacity-75">5 unread messages</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button style={buttonStyle} size="sm">
              Schedule Assessment
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{
                borderColor: config.brandColors.secondary,
                color: config.brandColors.secondary
              }}
            >
              Generate Report
            </Button>
            <Button
              size="sm"
              style={{
                backgroundColor: config.brandColors.accent,
                color: config.brandColors.background
              }}
            >
              Contact Client
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 text-xs opacity-60" style={{ borderTopColor: config.brandColors.border, borderTopWidth: '1px' }}>
            <p>&copy; 2024 {config.brandName || 'Your Practice'}. All rights reserved.</p>
            {config.contactInfo.phone && (
              <p className="mt-1">Phone: {config.contactInfo.phone}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                White Label Configuration
              </CardTitle>
              <CardDescription>
                Customize your professional brand appearance and client portal
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="white-label-enabled">Enable White Labeling</Label>
                <Switch
                  id="white-label-enabled"
                  checked={config.whiteLabelEnabled}
                  onCheckedChange={(checked) =>
                    setConfig(prev => ({ ...prev, whiteLabelEnabled: checked }))
                  }
                />
              </div>
              {config.whiteLabelEnabled && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {config.whiteLabelEnabled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Tabs */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="branding">Brand</TabsTrigger>
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="domain">Domain</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Identity</CardTitle>
                    <CardDescription>
                      Configure your brand name, logo, and basic identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          value={config.brandName}
                          onChange={(e) => setConfig(prev => ({ ...prev, brandName: e.target.value }))}
                          placeholder="Your Practice Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brandTagline">Brand Tagline</Label>
                        <Input
                          id="brandTagline"
                          value={config.brandTagline}
                          onChange={(e) => setConfig(prev => ({ ...prev, brandTagline: e.target.value }))}
                          placeholder="Professional Assessment Services"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brand Logo</Label>
                        <div className="flex items-center gap-4">
                          {config.brandLogoUrl && (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                              <img
                                src={config.brandLogoUrl}
                                alt="Brand logo"
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'logo')}
                              className="hidden"
                              id="logoUpload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('logoUpload')?.click()}
                              className="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </Button>
                            <p className="text-xs text-gray-600 mt-1">
                              Recommended: 200x200px, PNG or SVG
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div className="flex items-center gap-4">
                          {config.brandFaviconUrl && (
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border">
                              <img
                                src={config.brandFaviconUrl}
                                alt="Favicon"
                                className="w-full h-full object-contain rounded"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, 'favicon')}
                              className="hidden"
                              id="faviconUpload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('faviconUpload')?.click()}
                              className="w-full"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Favicon
                            </Button>
                            <p className="text-xs text-gray-600 mt-1">
                              Recommended: 32x32px, ICO or PNG
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>
                      Customize your brand colors and theme
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderColorPicker('primary', 'Primary Color')}
                      {renderColorPicker('secondary', 'Secondary Color')}
                      {renderColorPicker('accent', 'Accent Color')}
                      {renderColorPicker('background', 'Background Color')}
                      {renderColorPicker('text', 'Text Color')}
                      {renderColorPicker('border', 'Border Color')}
                      {renderColorPicker('muted', 'Muted Background')}
                      {renderColorPicker('success', 'Success Color')}
                      {renderColorPicker('warning', 'Warning Color')}
                      {renderColorPicker('destructive', 'Error Color')}
                    </div>

                    <div className="mt-6">
                      <Label>Color Preview</Label>
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {Object.entries(config.brandColors).map(([key, color]) => (
                          <div key={key} className="text-center">
                            <div
                              className="w-full h-16 rounded-md border shadow-sm"
                              style={{ backgroundColor: color as string }}
                            />
                            <p className="text-xs mt-1 capitalize font-medium">{key}</p>
                            <p className="text-xs text-gray-500 font-mono">{String(color)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Domain Tab */}
              <TabsContent value="domain" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Domain</CardTitle>
                    <CardDescription>
                      Configure your custom domain for the client portal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customDomain">Custom Domain</Label>
                      <div className="flex gap-2">
                        <Input
                          id="customDomain"
                          value={config.customDomain}
                          onChange={(e) => setConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                          placeholder="yourpractice.com"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(generatePreviewUrl())}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Enter your custom domain without http:// or https://
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Domain Setup Instructions</h4>
                      <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                        <li>Purchase a domain from a registrar (GoDaddy, Namecheap, etc.)</li>
                        <li>Add a CNAME record pointing to: <code className="bg-blue-100 px-1 rounded">portal.spectrumcare.platform</code></li>
                        <li>Wait for DNS propagation (up to 24 hours)</li>
                        <li>SSL certificate will be automatically configured</li>
                        <li>Contact support if you need assistance</li>
                      </ol>
                    </div>

                    <div className="space-y-2">
                      <Label>Current Portal URL</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-mono text-sm flex-1">{generatePreviewUrl()}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generatePreviewUrl(), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Configure contact details and social media links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone Number</Label>
                        <Input
                          id="contactPhone"
                          value={config.contactInfo.phone}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, phone: e.target.value }
                          }))}
                          placeholder="+44 123 456 7890"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={config.contactInfo.email}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, email: e.target.value }
                          }))}
                          placeholder="contact@yourpractice.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactAddress">Address</Label>
                      <Textarea
                        id="contactAddress"
                        value={config.contactInfo.address}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, address: e.target.value }
                        }))}
                        placeholder="123 Professional Street, City, Postcode"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactWebsite">Website</Label>
                      <Input
                        id="contactWebsite"
                        type="url"
                        value={config.contactInfo.website}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, website: e.target.value }
                        }))}
                        placeholder="https://yourpractice.com"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Social Media Links</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter</Label>
                          <Input
                            id="twitter"
                            value={config.socialMedia.twitter}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                            }))}
                            placeholder="@yourpractice"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={config.socialMedia.linkedin}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                            }))}
                            placeholder="company/yourpractice"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Portal Features</CardTitle>
                    <CardDescription>
                      Configure which features are available to your clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      {Object.entries(config.features).map(([feature, enabled]) => (
                        <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium capitalize">
                              {feature.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {feature === 'clientPortal' && 'Allow clients to access their personal portal'}
                              {feature === 'onlineBooking' && 'Enable online appointment booking'}
                              {feature === 'documentSharing' && 'Share reports and documents securely'}
                              {feature === 'messaging' && 'Internal messaging system'}
                              {feature === 'reports' && 'Generate and view assessment reports'}
                              {feature === 'payments' && 'Online payment processing'}
                            </p>
                          </div>
                          <Switch
                            checked={Boolean(enabled)}
                            onCheckedChange={(checked) => setConfig(prev => ({
                              ...prev,
                              features: { ...prev.features, [feature]: checked }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure advanced customization options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={config.settings.timezone}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, timezone: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                            <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select
                          value={config.settings.dateFormat}
                          onValueChange={(value) => setConfig(prev => ({
                            ...prev,
                            settings: { ...prev.settings, dateFormat: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customCSS">Custom CSS</Label>
                      <Textarea
                        id="customCSS"
                        value={config.customCSS}
                        onChange={(e) => setConfig(prev => ({ ...prev, customCSS: e.target.value }))}
                        placeholder="/* Add your custom CSS here */"
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-sm text-gray-600">
                        Add custom CSS to further customize the appearance of your portal
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Save Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            'Saving...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
