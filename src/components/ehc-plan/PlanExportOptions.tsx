'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  FileText,
  File,
  Globe,
  Code2,
  Mail,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Eye,
  Settings,
  Shield,
  RefreshCw
} from 'lucide-react';

interface PlanExportOptionsProps {
  plan: any;
}

interface ExportSettings {
  format: 'pdf' | 'docx' | 'html' | 'json';
  includeSections: string[];
  includeComments: boolean;
  includeMetadata: boolean;
  includeCompliance: boolean;
  confidentiality: 'full' | 'redacted' | 'summary';
  purpose: 'submission' | 'review' | 'tribunal' | 'sharing' | 'archive';
  watermark: boolean;
  pageNumbers: boolean;
  tableOfContents: boolean;
}

const EXPORT_FORMATS = {
  pdf: {
    name: 'PDF Document',
    description: 'Professional PDF suitable for official submission',
    icon: FileText,
    features: ['Professional formatting', 'Page breaks', 'Headers/footers', 'Digital signatures'],
    recommended: ['submission', 'tribunal', 'archive']
  },
  docx: {
    name: 'Word Document',
    description: 'Editable Word document for further customization',
    icon: File,
    features: ['Fully editable', 'Track changes', 'Comments', 'Collaborative editing'],
    recommended: ['review', 'sharing']
  },
  html: {
    name: 'Web Page',
    description: 'Interactive web page for online viewing',
    icon: Globe,
    features: ['Interactive navigation', 'Responsive design', 'Print friendly', 'Accessible'],
    recommended: ['sharing', 'review']
  },
  json: {
    name: 'JSON Data',
    description: 'Structured data for system integration',
    icon: Code2,
    features: ['Machine readable', 'API integration', 'Data analysis', 'Backup'],
    recommended: ['archive', 'integration']
  }
};

const SECTION_GROUPS = {
  essential: {
    name: 'Essential Sections',
    sections: ['child_views', 'parent_views', 'educational_needs', 'outcomes', 'educational_provision']
  },
  additional: {
    name: 'Additional Sections',
    sections: ['health_needs', 'social_care_needs', 'health_provision', 'social_care_provision']
  },
  administrative: {
    name: 'Administrative',
    sections: ['placement', 'personal_budget', 'advice_information']
  }
};

export default function PlanExportOptions({ plan }: PlanExportOptionsProps) {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    includeSections: ['child_views', 'parent_views', 'educational_needs', 'outcomes', 'educational_provision'],
    includeComments: false,
    includeMetadata: true,
    includeCompliance: true,
    confidentiality: 'full',
    purpose: 'submission',
    watermark: false,
    pageNumbers: true,
    tableOfContents: true
  });

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);
    setExportStatus('Preparing export...');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 20;

          if (newProgress > 20 && newProgress < 50) {
            setExportStatus('Compiling sections...');
          } else if (newProgress > 50 && newProgress < 80) {
            setExportStatus('Formatting document...');
          } else if (newProgress > 80) {
            setExportStatus('Finalizing export...');
          }

          return Math.min(newProgress, 90);
        });
      }, 300);

      const response = await fetch(`/api/ehc-plans/${plan.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportSettings)
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const filename = `${plan.planNumber}_${plan.child.firstName}_${plan.child.lastName}.${exportSettings.format}`;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExportProgress(100);
        setExportStatus('Export completed!');

        // Add to export history
        setExportHistory(prev => [{
          format: exportSettings.format,
          purpose: exportSettings.purpose,
          timestamp: new Date().toISOString(),
          filename
        }, ...prev]);

      } else {
        throw new Error('Export failed');
      }

    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('Export failed. Please try again.');
    } finally {
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
        setExportStatus('');
      }, 2000);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await fetch(`/api/ehc-plans/${plan.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...exportSettings, format: 'html' })
      });

      if (response.ok) {
        const htmlContent = await response.text();
        const newWindow = window.open();
        newWindow?.document.write(htmlContent);
        newWindow?.document.close();
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const updateSettings = (updates: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleSection = (sectionType: string) => {
    const isIncluded = exportSettings.includeSections.includes(sectionType);
    if (isIncluded) {
      updateSettings({
        includeSections: exportSettings.includeSections.filter(s => s !== sectionType)
      });
    } else {
      updateSettings({
        includeSections: [...exportSettings.includeSections, sectionType]
      });
    }
  };

  const selectAllSections = (groupSections: string[]) => {
    const allSelected = groupSections.every(s => exportSettings.includeSections.includes(s));
    if (allSelected) {
      updateSettings({
        includeSections: exportSettings.includeSections.filter(s => !groupSections.includes(s))
      });
    } else {
      updateSettings({
        includeSections: [...new Set([...exportSettings.includeSections, ...groupSections])]
      });
    }
  };

  const getFormatIcon = (format: string) => {
    const Icon = EXPORT_FORMATS[format]?.icon || FileText;
    return <Icon className="h-5 w-5" />;
  };

  const getReadinessScore = () => {
    const totalSections = plan.sections.length;
    const completedSections = plan.sections.filter(s =>
      s.status === 'approved' || s.status === 'reviewed'
    ).length;

    const baseScore = (completedSections / totalSections) * 70;
    const complianceScore = plan.legalComplianceScore * 0.2;
    const confidenceScore = plan.aiConfidenceScore * 0.1;

    return Math.round(baseScore + complianceScore + confidenceScore);
  };

  const readinessScore = getReadinessScore();

  return (
    <div className="space-y-6">
      {/* Export Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Export Readiness
          </CardTitle>
          <CardDescription>
            Check how ready your plan is for export and submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Readiness</span>
              <Badge className={readinessScore >= 90 ? 'bg-green-100 text-green-800' : readinessScore >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                {readinessScore}%
              </Badge>
            </div>
            <Progress value={readinessScore} className="h-3" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Sections Complete:</span>
                <span className="font-medium">
                  {plan.sections.filter(s => s.status === 'approved' || s.status === 'reviewed').length}/{plan.sections.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Legal Compliance:</span>
                <span className="font-medium">{plan.legalComplianceScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>AI Confidence:</span>
                <span className="font-medium">{plan.aiConfidenceScore}%</span>
              </div>
            </div>

            {readinessScore < 90 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Consider reviewing incomplete sections and addressing compliance issues before submitting.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Export Format</CardTitle>
            <CardDescription>
              Choose the format that best suits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(EXPORT_FORMATS).map(([format, info]) => (
                <Card
                  key={format}
                  className={`cursor-pointer border-2 transition-colors ${
                    exportSettings.format === format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateSettings({ format: format as any })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getFormatIcon(format)}
                      <div className="flex-1">
                        <h4 className="font-semibold">{info.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {info.features.map(feature => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {exportSettings.format === format && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Customize what to include in your export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium mb-2">Export Purpose</label>
              <Select value={exportSettings.purpose} onValueChange={(value: any) => updateSettings({ purpose: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submission">Official Submission</SelectItem>
                  <SelectItem value="review">Professional Review</SelectItem>
                  <SelectItem value="tribunal">Tribunal Proceedings</SelectItem>
                  <SelectItem value="sharing">Family Sharing</SelectItem>
                  <SelectItem value="archive">Archive Copy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confidentiality */}
            <div>
              <label className="block text-sm font-medium mb-2">Confidentiality Level</label>
              <Select value={exportSettings.confidentiality} onValueChange={(value: any) => updateSettings({ confidentiality: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Details</SelectItem>
                  <SelectItem value="redacted">Sensitive Info Redacted</SelectItem>
                  <SelectItem value="summary">Summary Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeComments"
                  checked={exportSettings.includeComments}
                  onCheckedChange={(checked) => updateSettings({ includeComments: checked as boolean })}
                />
                <label htmlFor="includeComments" className="text-sm">Include comments and reviews</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeMetadata"
                  checked={exportSettings.includeMetadata}
                  onCheckedChange={(checked) => updateSettings({ includeMetadata: checked as boolean })}
                />
                <label htmlFor="includeMetadata" className="text-sm">Include creation metadata</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCompliance"
                  checked={exportSettings.includeCompliance}
                  onCheckedChange={(checked) => updateSettings({ includeCompliance: checked as boolean })}
                />
                <label htmlFor="includeCompliance" className="text-sm">Include compliance report</label>
              </div>

              {exportSettings.format === 'pdf' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tableOfContents"
                      checked={exportSettings.tableOfContents}
                      onCheckedChange={(checked) => updateSettings({ tableOfContents: checked as boolean })}
                    />
                    <label htmlFor="tableOfContents" className="text-sm">Table of contents</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pageNumbers"
                      checked={exportSettings.pageNumbers}
                      onCheckedChange={(checked) => updateSettings({ pageNumbers: checked as boolean })}
                    />
                    <label htmlFor="pageNumbers" className="text-sm">Page numbers</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="watermark"
                      checked={exportSettings.watermark}
                      onCheckedChange={(checked) => updateSettings({ watermark: checked as boolean })}
                    />
                    <label htmlFor="watermark" className="text-sm">Watermark (DRAFT/CONFIDENTIAL)</label>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Sections to Include</CardTitle>
          <CardDescription>
            Select which sections of the plan to include in the export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(SECTION_GROUPS).map(([groupKey, group]) => {
              const groupSections = plan.sections.filter(s => group.sections.includes(s.sectionType));
              const allSelected = groupSections.every(s => exportSettings.includeSections.includes(s.sectionType));

              return (
                <div key={groupKey} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{group.name}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllSections(group.sections)}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groupSections.map(section => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={exportSettings.includeSections.includes(section.sectionType)}
                            onCheckedChange={() => toggleSection(section.sectionType)}
                          />
                          <div>
                            <div className="font-medium text-sm">{section.sectionTitle}</div>
                            <div className="text-xs text-gray-500">
                              {section.wordCount} words • {section.status}
                            </div>
                          </div>
                        </div>
                        <Badge className={section.status === 'approved' || section.status === 'reviewed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {section.status === 'approved' || section.status === 'reviewed' ? 'Ready' : 'Draft'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Actions</CardTitle>
          <CardDescription>
            Preview or download your EHC plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exporting ? (
            <div className="space-y-4">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="font-medium">{exportStatus}</p>
              </div>
              <Progress value={exportProgress} className="h-3" />
              <p className="text-sm text-center text-gray-600">{Math.round(exportProgress)}% complete</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={exportSettings.includeSections.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>

              <Button
                onClick={handleExport}
                disabled={exportSettings.includeSections.length === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export {EXPORT_FORMATS[exportSettings.format].name}
              </Button>
            </div>
          )}

          {exportSettings.includeSections.length === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select at least one section to export.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.slice(0, 5).map((export_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(export_.format)}
                    <div>
                      <div className="font-medium text-sm">{export_.filename}</div>
                      <div className="text-xs text-gray-500">
                        {export_.purpose} • {new Date(export_.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {export_.format.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
