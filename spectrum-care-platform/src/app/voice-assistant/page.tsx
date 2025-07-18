'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Smartphone,
  MessageSquare,
  Brain,
  Zap,
  ArrowLeft,
  Settings,
  Globe,
  Languages,
  Phone,
  Video,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Shield,
  Heart,
  FileText,
  TrendingUp,
  GraduationCap,
  Home,
  Headphones,
  Radio,
  Send,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Download,
  Upload,
  Star,
  Target,
  Lightbulb,
  Wand2,
  Sparkles,
  Cpu,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Signal,
  Battery,
  PowerOff,
  Power,
  Repeat,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind
} from 'lucide-react';

interface VoiceCapabilities {
  transcription: boolean;
  naturalLanguage: boolean;
  multiLanguage: boolean;
  whatsappIntegration: boolean;
  crisisDetection: boolean;
  contextAwareness: boolean;
}

interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  language: string;
  context: any;
}

interface VoiceCommand {
  command: string;
  response: string;
  action: string;
  success: boolean;
  timestamp: string;
}

export default function VoiceAssistantPage() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [response, setResponse] = useState('');
  const [capabilities, setCapabilities] = useState<VoiceCapabilities | null>(null);
  const [activeSession, setActiveSession] = useState<VoiceSession | null>(null);
  const [voiceHistory, setVoiceHistory] = useState<VoiceCommand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-GB');
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testCommand, setTestCommand] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const supportedLanguages = [
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' }
  ];

  const exampleCommands = [
    "Schedule OT appointment next week",
    "Show my budget status",
    "Find speech therapist nearby",
    "Check EHC plan progress",
    "Record new achievement",
    "Message school SENCO",
    "Show upcoming appointments",
    "Emergency help needed",
    "Track medication reminder",
    "Compare therapy providers"
  ];

  useEffect(() => {
    loadVoiceAssistantData();
    requestMicrophonePermission();
  }, []);

  const loadVoiceAssistantData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch('/api/voice-assistant', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load voice assistant data');
      }

      const data = await response.json();
      setCapabilities(data.data.capabilities);
      setActiveSession(data.data.activeSession);
      setIsWhatsAppConnected(data.data.isWhatsAppConnected);
      setIsConnected(true);

    } catch (error) {
      console.error('Error loading voice assistant:', error);
      setError('Failed to initialize voice assistant');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      setupAudioAnalysis(stream);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
    }
  };

  const setupAudioAnalysis = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    // Start audio level monitoring
    monitorAudioLevel();
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);

      if (isListening) {
        requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  };

  const startListening = async () => {
    if (micPermission !== 'granted') {
      await requestMicrophonePermission();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudioCommand(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      setupAudioAnalysis(stream);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting voice recording:', error);
      setError('Failed to start voice recording');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setAudioLevel(0);
    }
  };

  const processAudioCommand = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      // Convert audio to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onload = async () => {
        const audioData = reader.result as string;

        const authToken = localStorage.getItem('authToken');
        const response = await fetch('/api/voice-assistant', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'process_voice_command',
            audioData: audioData.split(',')[1], // Remove data:audio/wav;base64,
            sessionId: activeSession?.sessionId,
            context: {
              currentPage: 'voice-assistant',
              language: selectedLanguage
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to process voice command');
        }

        const data = await response.json();
        handleVoiceResponse(data.data);
      };

    } catch (error) {
      console.error('Error processing audio command:', error);
      setError('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextCommand = async (command: string) => {
    if (!command.trim()) return;

    try {
      setIsProcessing(true);
      setCurrentCommand(command);

      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/voice-assistant', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'process_voice_command',
          command: command,
          transcription: command,
          sessionId: activeSession?.sessionId,
          context: {
            currentPage: 'voice-assistant',
            language: selectedLanguage
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process text command');
      }

      const data = await response.json();
      handleVoiceResponse(data.data);

    } catch (error) {
      console.error('Error processing text command:', error);
      setError('Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceResponse = (responseData: any) => {
    setResponse(responseData.message);

    // Add to command history
    const newCommand: VoiceCommand = {
      command: currentCommand || 'Voice command',
      response: responseData.message,
      action: responseData.action,
      success: responseData.success,
      timestamp: new Date().toISOString()
    };

    setVoiceHistory(prev => [newCommand, ...prev.slice(0, 9)]); // Keep last 10 commands

    // Speak the response if text-to-speech is enabled
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(responseData.message);
      utterance.lang = selectedLanguage;
      speechSynthesis.speak(utterance);
    }

    // Handle specific actions
    if (responseData.action === 'emergency_response') {
      // Show emergency alert
      setError('Emergency support activated');
    } else if (responseData.action === 'schedule_appointment') {
      // Could navigate to booking page
    }
  };

  const startVoiceSession = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/voice-assistant', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start_voice_session',
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start voice session');
      }

      const data = await response.json();
      setActiveSession({
        sessionId: data.data.sessionId,
        isActive: true,
        language: selectedLanguage,
        context: {}
      });

    } catch (error) {
      console.error('Error starting voice session:', error);
      setError('Failed to start voice session');
    }
  };

  const endVoiceSession = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      await fetch('/api/voice-assistant', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'end_voice_session',
          sessionId: activeSession?.sessionId
        })
      });

      setActiveSession(null);

    } catch (error) {
      console.error('Error ending voice session:', error);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageFlag = (code: string) => {
    const lang = supportedLanguages.find(l => l.code === code);
    return lang ? lang.flag : '🌐';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Initializing voice assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">WhatsApp Voice Assistant</h1>
                  <p className="text-sm text-gray-500">Hands-free autism support platform control</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </>
                )}
              </Badge>
              <Badge className={isWhatsAppConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {isWhatsAppConnected ? (
                  <>
                    <Smartphone className="h-3 w-3 mr-1" />
                    WhatsApp Active
                  </>
                ) : (
                  <>
                    <Phone className="h-3 w-3 mr-1" />
                    WhatsApp Setup
                  </>
                )}
              </Badge>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant={error.includes('Emergency') ? 'destructive' : 'default'} className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Voice Assistant Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Voice Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voice Control Card */}
            <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  {/* Microphone Button */}
                  <div className="relative">
                    <Button
                      size="lg"
                      className={`w-32 h-32 rounded-full text-white transition-all duration-300 ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      }`}
                      onClick={toggleListening}
                      disabled={micPermission === 'denied' || isProcessing}
                    >
                      {isListening ? (
                        <MicOff className="h-12 w-12" />
                      ) : (
                        <Mic className="h-12 w-12" />
                      )}
                    </Button>

                    {/* Audio Level Indicator */}
                    {isListening && (
                      <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping"
                           style={{
                             transform: `scale(${1 + (audioLevel / 100)})`,
                             opacity: Math.max(0.3, audioLevel / 255)
                           }} />
                    )}
                  </div>

                  {/* Status Text */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isProcessing ? 'Processing...' :
                       isListening ? 'Listening...' :
                       'Tap to Speak'}
                    </h2>
                    <p className="text-gray-600">
                      {isProcessing ? 'Understanding your command' :
                       isListening ? 'Speak your command clearly' :
                       'Voice commands in over 7 languages'}
                    </p>
                  </div>

                  {/* Permission Alert */}
                  {micPermission === 'denied' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Microphone access denied. Please enable microphone permissions in your browser settings.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Audio Level Bar */}
                  {isListening && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Audio Level</p>
                      <Progress value={(audioLevel / 255) * 100} className="w-64 mx-auto" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Text Input Alternative */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Text Command Input
                </CardTitle>
                <CardDescription>
                  Type your command if voice input is not available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Input
                    placeholder="Type your command here..."
                    value={testCommand}
                    onChange={(e) => setTestCommand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && processTextCommand(testCommand)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => processTextCommand(testCommand)}
                    disabled={!testCommand.trim() || isProcessing}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Display */}
            {response && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Brain className="h-5 w-5 mr-2" />
                    Assistant Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-green-800 whitespace-pre-wrap">{response}</p>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            const utterance = new SpeechSynthesisUtterance(response);
                            utterance.lang = selectedLanguage;
                            speechSynthesis.speak(utterance);
                          }
                        }}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Speak
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(response)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Example Commands */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Example Commands
                </CardTitle>
                <CardDescription>
                  Try these voice commands to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exampleCommands.map((command, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => {
                        setTestCommand(command);
                        processTextCommand(command);
                      }}
                    >
                      <PlayCircle className="h-3 w-3 mr-2 text-blue-600" />
                      <span className="text-xs">{command}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-purple-600" />
                  Session Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Session</span>
                  <Badge className={activeSession?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {activeSession?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Language</span>
                  <span className="text-sm font-medium">
                    {getLanguageFlag(selectedLanguage)} {selectedLanguage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microphone</span>
                  <Badge className={micPermission === 'granted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {micPermission === 'granted' ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp</span>
                  <Badge className={isWhatsAppConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {isWhatsAppConnected ? 'Connected' : 'Setup Required'}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  {!activeSession?.isActive ? (
                    <Button onClick={startVoiceSession} className="w-full">
                      <Power className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <Button onClick={endVoiceSession} variant="outline" className="w-full">
                      <PowerOff className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            {capabilities && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-blue-600" />
                    AI Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.transcription ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">Transcription</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.naturalLanguage ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">Natural Language</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.multiLanguage ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">Multi-Language</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.whatsappIntegration ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">WhatsApp</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.crisisDetection ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">Crisis Detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${capabilities.contextAwareness ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-xs">Context Aware</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Command History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-600" />
                  Recent Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {voiceHistory.length > 0 ? (
                    voiceHistory.map((cmd, index) => (
                      <div key={index} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{cmd.command}</span>
                          <span className="text-xs text-gray-500">{formatTime(cmd.timestamp)}</span>
                        </div>
                        <p className="text-gray-600 text-xs line-clamp-2">{cmd.response}</p>
                        <div className="flex items-center mt-2">
                          <Badge className={cmd.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {cmd.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-500">No commands yet</p>
                      <p className="text-xs text-gray-400">Start speaking to see history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 flex-col space-y-1"
                    onClick={() => processTextCommand('Emergency help needed')}
                  >
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-xs">Emergency</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 flex-col space-y-1"
                    onClick={() => processTextCommand('Show budget status')}
                  >
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs">Budget</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 flex-col space-y-1"
                    onClick={() => processTextCommand('Check appointments')}
                  >
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">Appointments</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-12 flex-col space-y-1"
                    onClick={() => processTextCommand('Show EHC plan status')}
                  >
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-xs">EHC Plan</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* WhatsApp Setup Instructions */}
        {!isWhatsAppConnected && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Smartphone className="h-5 w-5 mr-2" />
                WhatsApp Voice Assistant Setup
              </CardTitle>
              <CardDescription className="text-green-700">
                Enable hands-free voice commands through WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="text-green-800">
              <div className="space-y-4">
                <p className="font-medium">Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Add our WhatsApp Business number: <strong>+44 7123 456789</strong></li>
                  <li>Send "ACTIVATE VOICE" to start the integration</li>
                  <li>Follow the verification prompts</li>
                  <li>Begin using voice commands via WhatsApp</li>
                </ol>

                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <h4 className="font-medium mb-2">WhatsApp Voice Commands:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Send voice messages with your commands</li>
                    <li>• Text commands also supported</li>
                    <li>• Receive AI responses instantly</li>
                    <li>• Emergency detection and alerts</li>
                  </ul>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open WhatsApp Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
