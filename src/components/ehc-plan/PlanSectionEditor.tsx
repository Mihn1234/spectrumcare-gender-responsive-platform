'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Brain,
  Edit3,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Sparkles,
  MessageSquare,
  History,
  Copy,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PlanSection {
  id: string;
  sectionType: string;
  sectionTitle: string;
  content: string;
  aiGeneratedContent: string;
  humanReviewedContent: string;
  status: string;
  aiConfidence: number;
  version: number;
  wordCount: number;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanSectionEditorProps {
  plan: any;
  onUpdate: (updatedPlan: any) => void;
}

const SECTION_STATUS_COLORS = {
  'draft': 'bg-gray-100 text-gray-800',
  'ai_generated': 'bg-purple-100 text-purple-800',
  'under_review': 'bg-blue-100 text-blue-800',
  'reviewed': 'bg-green-100 text-green-800',
  'approved': 'bg-emerald-100 text-emerald-800',
  'needs_revision': 'bg-red-100 text-red-800'
};

const SECTION_DESCRIPTIONS = {
  'child_views': 'The child\'s own perspective on their needs, feelings, and aspirations',
  'parent_views': 'Parent/carer views on the child\'s needs and family circumstances',
  'educational_needs': 'Specific educational needs arising from the child\'s SEND',
  'health_needs': 'Health-related needs and medical requirements',
  'social_care_needs': 'Social care and family support needs',
  'outcomes': 'SMART goals and targets for the child to achieve',
  'educational_provision': 'Specific educational support and interventions',
  'health_provision': 'Health services, therapies, and medical support',
  'social_care_provision': 'Social care support and interventions',
  'placement': 'Educational placement and setting arrangements',
  'personal_budget': 'Personal budget arrangements and allocations',
  'advice_information': 'Professional advice and information sources'
};

export default function PlanSectionEditor({ plan, onUpdate }: PlanSectionEditorProps) {
  const [selectedSection, setSelectedSection] = useState<PlanSection | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAIContent, setShowAIContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    if (selectedSection) {
      setEditingContent(selectedSection.content || '');
    }
  }, [selectedSection]);

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleStartEditing = (section: PlanSection) => {
    setSelectedSection(section);
    setEditingContent(section.content || '');
    setIsEditing(true);
  };

  const handleSaveSection = async () => {
    if (!selectedSection) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/ehc-plans/${plan.id}/sections/${selectedSection.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: editingContent,
          status: 'reviewed'
        })
      });

      if (response.ok) {
        // Update the section in the plan
        const updatedSections = plan.sections.map(s =>
          s.id === selectedSection.id
            ? { ...s, content: editingContent, status: 'reviewed', updatedAt: new Date().toISOString() }
            : s
        );

        onUpdate({ ...plan, sections: updatedSections });
        setIsEditing(false);
      } else {
        throw new Error('Failed to save section');
      }
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateSection = async (section: PlanSection) => {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/ehc-plans/${plan.id}/sections/${section.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Update the section with regenerated content
        const updatedSections = plan.sections.map(s =>
          s.id === section.id
            ? { ...s, content: data.content, aiGeneratedContent: data.content, status: 'ai_generated', updatedAt: new Date().toISOString() }
            : s
        );

        onUpdate({ ...plan, sections: updatedSections });

        if (selectedSection?.id === section.id) {
          setEditingContent(data.content);
        }
      } else {
        throw new Error('Failed to regenerate section');
      }
    } catch (error) {
      console.error('Error regenerating section:', error);
      alert('Failed to regenerate section. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWordCountColor = (wordCount: number, sectionType: string) => {
    // Different sections have different ideal word counts
    const idealRanges = {
      'child_views': [300, 500],
      'parent_views': [400, 600],
      'educational_needs': [500, 800],
      'outcomes': [600, 1000],
      'educational_provision': [600, 1000],
      'health_provision': [400, 700]
    };

    const range = idealRanges[sectionType] || [300, 600];

    if (wordCount < range[0]) return 'text-red-600';
    if (wordCount > range[1]) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Section Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{plan.sections.length}</div>
            <div className="text-sm text-gray-600">Total Sections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {plan.sections.filter(s => s.status === 'approved' || s.status === 'reviewed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {plan.sections.filter(s => s.aiGeneratedContent).length}
            </div>
            <div className="text-sm text-gray-600">AI Generated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {plan.sections.filter(s => s.status === 'needs_revision' || s.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Need Attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {plan.sections.map((section: PlanSection) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSectionExpansion(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{section.sectionTitle}</CardTitle>
                      <Badge className={SECTION_STATUS_COLORS[section.status]}>
                        {section.status.replace('_', ' ')}
                      </Badge>
                      {section.aiGeneratedContent && (
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {SECTION_DESCRIPTIONS[section.sectionType]}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Metrics */}
                    <div className="text-right text-sm space-y-1">
                      <div className={`font-medium ${getConfidenceColor(section.aiConfidence)}`}>
                        AI: {section.aiConfidence}%
                      </div>
                      <div className={`${getWordCountColor(section.wordCount, section.sectionType)}`}>
                        {section.wordCount} words
                      </div>
                    </div>

                    {/* Expand/Collapse */}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEditing(section)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    {section.aiGeneratedContent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateSection(section)}
                        disabled={regenerating}
                      >
                        {regenerating ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Regenerate
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIContent(!showAIContent)}
                    >
                      {showAIContent ? (
                        <EyeOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      {showAIContent ? 'Hide' : 'Show'} AI Version
                    </Button>
                  </div>

                  {/* Content Display */}
                  <div className="space-y-4">
                    {/* Current Content */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Current Content
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="whitespace-pre-wrap text-sm">
                          {section.content || 'No content yet'}
                        </div>
                      </div>
                    </div>

                    {/* AI Generated Content (if toggled) */}
                    {showAIContent && section.aiGeneratedContent && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-purple-600" />
                          AI Generated Content
                        </h4>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="whitespace-pre-wrap text-sm">
                            {section.aiGeneratedContent}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium">Version</div>
                        <div>{section.version}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium">Last Updated</div>
                        <div>{new Date(section.updatedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-medium">Word Count</div>
                        <div className={getWordCountColor(section.wordCount, section.sectionType)}>
                          {section.wordCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Section Editor Modal */}
      {isEditing && selectedSection && (
        <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Edit {selectedSection.sectionTitle}
              </DialogTitle>
              <DialogDescription>
                Make changes to this section. Changes will be saved when you click Save.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Editor Tabs */}
              <Tabs defaultValue="editor" className="w-full">
                <TabsList>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="guidance">Writing Guidance</TabsTrigger>
                  {selectedSection.aiGeneratedContent && (
                    <TabsTrigger value="ai-content">AI Version</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="editor" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Section Content
                    </label>
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Enter the content for this section..."
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Word count: {editingContent.split(/\s+/).filter(w => w.length > 0).length}</span>
                      <span>Characters: {editingContent.length}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="guidance" className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Writing Tips for {selectedSection.sectionTitle}:</strong>
                      <br />
                      {SECTION_DESCRIPTIONS[selectedSection.sectionType]}
                    </AlertDescription>
                  </Alert>

                  {/* Section-specific guidance */}
                  <div className="space-y-3 text-sm">
                    {selectedSection.sectionType === 'child_views' && (
                      <div>
                        <h4 className="font-medium">Child Views Guidelines:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Use age-appropriate language</li>
                          <li>Include the child's own words where possible</li>
                          <li>Cover their feelings about school, home, and friendships</li>
                          <li>Mention their interests and what makes them happy</li>
                          <li>Include their hopes and aspirations for the future</li>
                        </ul>
                      </div>
                    )}

                    {selectedSection.sectionType === 'outcomes' && (
                      <div>
                        <h4 className="font-medium">Outcomes Guidelines:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>All outcomes must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)</li>
                          <li>Link directly to identified needs</li>
                          <li>Include both short-term and long-term goals</li>
                          <li>Specify how progress will be measured</li>
                          <li>Be aspirational yet realistic</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {selectedSection.aiGeneratedContent && (
                  <TabsContent value="ai-content" className="space-y-4">
                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        This is the AI-generated version. You can copy elements from here into your edit.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="whitespace-pre-wrap text-sm">
                        {selectedSection.aiGeneratedContent}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setEditingContent(selectedSection.aiGeneratedContent)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy AI Content to Editor
                    </Button>
                  </TabsContent>
                )}
              </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingContent(selectedSection.content || '')}
                  >
                    Reset
                  </Button>

                  <Button
                    onClick={handleSaveSection}
                    disabled={saving || editingContent === selectedSection.content}
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
