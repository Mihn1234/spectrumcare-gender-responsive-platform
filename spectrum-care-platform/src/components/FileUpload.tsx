'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  Loader2,
  Brain,
  Lock
} from 'lucide-react';
import { useApiCall } from '@/hooks/useAuth';

interface FileUploadProps {
  childId?: string;
  caseId?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  showAIAnalysis?: boolean;
}

interface UploadResult {
  documentId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  hasAiAnalysis: boolean;
  aiAnalysis?: {
    keyInformation: any;
    identifiedNeeds: string[];
    recommendations: string[];
    confidence: number;
  };
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  result?: UploadResult;
  documentType: string;
  documentCategory: string;
  isConfidential: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'assessment', label: 'Assessment Report' },
  { value: 'medical', label: 'Medical Report' },
  { value: 'educational', label: 'Educational Report' },
  { value: 'therapy', label: 'Therapy Report' },
  { value: 'ehc_plan', label: 'EHC Plan' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'legal', label: 'Legal Document' },
  { value: 'other', label: 'Other' }
];

const DOCUMENT_CATEGORIES = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'intervention', label: 'Intervention' },
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'legal', label: 'Legal' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'personal', label: 'Personal' }
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'text/plain': ['.txt']
};

export function FileUpload({
  childId,
  caseId,
  onUploadComplete,
  onUploadError,
  allowMultiple = true,
  maxFiles = 10,
  showAIAnalysis = true
}: FileUploadProps) {
  const { makeApiCall } = useApiCall();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileIdCounter = useRef(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      id: `file-${++fileIdCounter.current}`,
      file,
      status: 'pending',
      progress: 0,
      documentType: 'other',
      documentCategory: 'uploaded',
      isConfidential: false
    }));

    setUploadFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, maxFiles);
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: allowMultiple,
    disabled: isUploading
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileSettings = (fileId: string, settings: Partial<Pick<UploadFile, 'documentType' | 'documentCategory' | 'isConfidential'>>) => {
    setUploadFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, ...settings } : f
    ));
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    if (childId) formData.append('childId', childId);
    if (caseId) formData.append('caseId', caseId);
    formData.append('documentType', uploadFile.documentType);
    formData.append('documentCategory', uploadFile.documentCategory);
    formData.append('isConfidential', uploadFile.isConfidential.toString());

    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      // Simulate upload progress (since we can't track real progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.status === 'uploading') {
            const newProgress = Math.min(f.progress + 10, 90);
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);

      const response = await makeApiCall('/api/files/upload', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          // Update to processing if AI analysis is happening
          if (result.data.hasAiAnalysis) {
            setUploadFiles(prev => prev.map(f =>
              f.id === uploadFile.id ? { ...f, status: 'processing', progress: 95 } : f
            ));

            // Simulate AI processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // Update to completed
          setUploadFiles(prev => prev.map(f =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'completed',
                  progress: 100,
                  result: result.data
                }
              : f
          ));

          onUploadComplete?.(result.data);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } else {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Upload failed');
      }
    } catch (error) {
      setUploadFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? {
              ...f,
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));

      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        await uploadSingleFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasCompletedFiles = uploadFiles.some(f => f.status === 'completed');
  const hasErrorFiles = uploadFiles.some(f => f.status === 'error');
  const hasPendingFiles = uploadFiles.some(f => f.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Word documents, images, and text files up to 50MB
                </p>
              </div>
            )}
          </div>

          {uploadFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(uploadFile.file)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium truncate">{uploadFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusIcon(uploadFile.status)}
                          {uploadFile.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(uploadFile.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                        <div className="mb-3">
                          <Progress value={uploadFile.progress} className="w-full" />
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadFile.status === 'processing' ? 'Processing with AI...' : 'Uploading...'}
                          </p>
                        </div>
                      )}

                      {/* Error Message */}
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{uploadFile.error}</AlertDescription>
                        </Alert>
                      )}

                      {/* File Settings */}
                      {uploadFile.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <Label htmlFor={`docType-${uploadFile.id}`}>Document Type</Label>
                            <Select
                              value={uploadFile.documentType}
                              onValueChange={(value) => updateFileSettings(uploadFile.id, { documentType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`docCategory-${uploadFile.id}`}>Category</Label>
                            <Select
                              value={uploadFile.documentCategory}
                              onValueChange={(value) => updateFileSettings(uploadFile.id, { documentCategory: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOCUMENT_CATEGORIES.map(category => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`confidential-${uploadFile.id}`}
                              checked={uploadFile.isConfidential}
                              onCheckedChange={(checked) =>
                                updateFileSettings(uploadFile.id, { isConfidential: !!checked })
                              }
                            />
                            <Label htmlFor={`confidential-${uploadFile.id}`} className="flex items-center space-x-1">
                              <Lock className="h-4 w-4" />
                              <span>Confidential</span>
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* AI Analysis Results */}
                      {uploadFile.status === 'completed' && uploadFile.result?.hasAiAnalysis && showAIAnalysis && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-900">AI Analysis Complete</span>
                            <Badge variant="secondary">
                              {Math.round((uploadFile.result.aiAnalysis?.confidence || 0) * 100)}% confidence
                            </Badge>
                          </div>

                          {uploadFile.result.aiAnalysis?.identifiedNeeds && uploadFile.result.aiAnalysis.identifiedNeeds.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-blue-900">Identified Needs:</p>
                              <ul className="text-sm text-blue-800 list-disc list-inside">
                                {uploadFile.result.aiAnalysis.identifiedNeeds.slice(0, 3).map((need, index) => (
                                  <li key={index}>{need}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {uploadFile.result.aiAnalysis?.recommendations && uploadFile.result.aiAnalysis.recommendations.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-blue-900">Key Recommendations:</p>
                              <ul className="text-sm text-blue-800 list-disc list-inside">
                                {uploadFile.result.aiAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Success Message */}
                      {uploadFile.status === 'completed' && (
                        <div className="mt-3 flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Upload completed successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Upload Button */}
              {hasPendingFiles && (
                <div className="flex justify-end">
                  <Button
                    onClick={uploadAllFiles}
                    disabled={isUploading}
                    className="min-w-32"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {(hasCompletedFiles || hasErrorFiles) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {hasCompletedFiles && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>{uploadFiles.filter(f => f.status === 'completed').length} files uploaded</span>
                  </div>
                )}
                {hasErrorFiles && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>{uploadFiles.filter(f => f.status === 'error').length} files failed</span>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setUploadFiles([])}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
