// User Management Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
}

export type UserRole = 'parent' | 'professional' | 'la_staff' | 'school_staff' | 'healthcare_provider' | 'legal_advocate' | 'admin';

export interface UserProfile {
  phone?: string;
  address?: Address;
  preferences: UserPreferences;
  qualifications?: Qualification[];
  specializations?: string[];
  availability?: Availability;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  accessibility: AccessibilitySettings;
  communication: CommunicationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  inApp: boolean;
  urgentOnly: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

export interface CommunicationPreferences {
  preferredLanguage: string;
  preferredContactMethod: 'email' | 'phone' | 'whatsapp' | 'app';
  bestContactTimes: string[];
}

// Child Profile Types
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parentIds: string[];
  diagnoses: Diagnosis[];
  ehcPlan?: EHCPlan;
  assessments: Assessment[];
  interventions: Intervention[];
  documents: Document[];
  timeline: TimelineEvent[];
  currentNeeds: Need[];
  supportNetwork: SupportNetworkMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Diagnosis {
  id: string;
  condition: string;
  diagnosedBy: string;
  diagnosedDate: Date;
  severity?: 'mild' | 'moderate' | 'severe';
  notes: string;
  supportingDocuments: string[];
}

export interface Need {
  id: string;
  category: NeedCategory;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  identifiedBy: string;
  identifiedDate: Date;
  currentSupport?: string;
  recommendedSupport?: string;
  status: 'identified' | 'being_addressed' | 'met' | 'unmet';
}

export type NeedCategory =
  | 'communication'
  | 'social_emotional'
  | 'sensory'
  | 'behavioral'
  | 'academic'
  | 'physical'
  | 'medical'
  | 'daily_living'
  | 'independence';

// Assessment Types
export interface Assessment {
  id: string;
  childId: string;
  type: AssessmentType;
  professionalId: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: AssessmentStatus;
  results?: AssessmentResults;
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  cost: number;
  fundingSource: 'private' | 'nhs' | 'la' | 'insurance';
}

export type AssessmentType =
  | 'autism_diagnostic'
  | 'educational_psychology'
  | 'speech_language'
  | 'occupational_therapy'
  | 'behavioural_analysis'
  | 'medical_assessment'
  | 'nutritional_assessment'
  | 'sensory_assessment'
  | 'cognitive_assessment';

export type AssessmentStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export interface AssessmentResults {
  scores?: Record<string, number>;
  categories?: Record<string, string>;
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

// Professional Types
export interface Professional {
  id: string;
  userId: string;
  profession: ProfessionType;
  qualifications: Qualification[];
  specializations: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  availability: Availability;
  rates: ServiceRates;
  location: Location;
  travelRadius: number;
  languages: string[];
  isVerified: boolean;
  insurance: InsuranceDetails;
}

export type ProfessionType =
  | 'educational_psychologist'
  | 'clinical_psychologist'
  | 'speech_language_therapist'
  | 'occupational_therapist'
  | 'behavioural_analyst'
  | 'autism_specialist'
  | 'medical_doctor'
  | 'psychiatrist'
  | 'nutritionist'
  | 'physiotherapist'
  | 'sen_lawyer'
  | 'advocate';

export interface Qualification {
  title: string;
  institution: string;
  year: number;
  registrationNumber?: string;
  expiryDate?: Date;
}

export interface Availability {
  weekdays: DayAvailability[];
  timeZone: string;
  advanceBooking: number; // days
  cancellationPolicy: string;
}

export interface DayAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  available: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface ServiceRates {
  consultation: number;
  assessment: number;
  therapy: number;
  report: number;
  travel?: number;
  emergency?: number;
}

// EHC Plan Types
export interface EHCPlan {
  id: string;
  childId: string;
  status: EHCPlanStatus;
  startDate: Date;
  reviewDate: Date;
  localAuthority: string;
  officialPlan?: EHCPlanDocument;
  shadowPlan?: EHCPlanDocument;
  timeline: EHCPlanTimeline[];
  deadlines: Deadline[];
  communications: Communication[];
  appeals?: Appeal[];
}

export type EHCPlanStatus =
  | 'assessment_requested'
  | 'assessment_in_progress'
  | 'draft_received'
  | 'consultation_period'
  | 'finalized'
  | 'active'
  | 'under_review'
  | 'appealed'
  | 'ceased';

export interface EHCPlanDocument {
  sections: EHCPlanSection[];
  provisions: Provision[];
  outcomes: Outcome[];
  lastUpdated: Date;
  version: number;
}

export interface EHCPlanSection {
  sectionLetter: string;
  title: string;
  content: string;
  lastUpdated: Date;
}

export interface Provision {
  id: string;
  description: string;
  quantity: string;
  frequency: string;
  duration: string;
  provider: string;
  cost?: number;
  startDate?: Date;
  endDate?: Date;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface Outcome {
  id: string;
  description: string;
  targetDate: Date;
  measurableSteps: string[];
  progress: number; // 0-100
  lastReviewed: Date;
  status: 'not_started' | 'in_progress' | 'achieved' | 'partially_achieved' | 'not_achieved';
}

// Communication Types
export interface Communication {
  id: string;
  type: CommunicationType;
  subject: string;
  content: string;
  sender: string;
  recipients: string[];
  timestamp: Date;
  attachments?: string[];
  response?: Communication;
  isUrgent: boolean;
  tags: string[];
}

export type CommunicationType =
  | 'email'
  | 'letter'
  | 'phone_call'
  | 'meeting'
  | 'whatsapp'
  | 'internal_message'
  | 'legal_notice';

// Document Types
export interface Document {
  id: string;
  childId?: string;
  title: string;
  type: DocumentType;
  category: DocumentCategory;
  uploadedBy: string;
  uploadedDate: Date;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  isConfidential: boolean;
  aiAnalysis?: AIAnalysis;
  tags: string[];
  expiryDate?: Date;
}

export type DocumentType =
  | 'assessment_report'
  | 'medical_report'
  | 'therapy_report'
  | 'school_report'
  | 'ehc_plan'
  | 'legal_document'
  | 'correspondence'
  | 'photo'
  | 'video'
  | 'other';

export type DocumentCategory =
  | 'diagnosis'
  | 'assessment'
  | 'intervention'
  | 'education'
  | 'legal'
  | 'medical'
  | 'administrative'
  | 'personal';

export interface AIAnalysis {
  extractedText: string;
  keyInformation: Record<string, any>;
  recommendations: string[];
  identifiedNeeds: string[];
  timeline: TimelineEvent[];
  confidence: number;
  processedDate: Date;
}

// Timeline Types
export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: TimelineCategory;
  importance: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  relatedDocuments: string[];
  relatedPeople: string[];
}

export type TimelineCategory =
  | 'diagnosis'
  | 'assessment'
  | 'intervention_start'
  | 'intervention_end'
  | 'school_transition'
  | 'ehc_plan_milestone'
  | 'legal_action'
  | 'medical_appointment'
  | 'review'
  | 'other';

// Legal Types
export interface Appeal {
  id: string;
  ehcPlanId: string;
  type: AppealType;
  grounds: string[];
  submittedDate: Date;
  hearingDate?: Date;
  status: AppealStatus;
  outcome?: AppealOutcome;
  legalRepresentation?: LegalRepresentation;
  evidence: string[];
}

export type AppealType =
  | 'first_tier_tribunal'
  | 'upper_tribunal'
  | 'high_court'
  | 'judicial_review'
  | 'ombudsman_complaint';

export type AppealStatus =
  | 'preparing'
  | 'submitted'
  | 'acknowledged'
  | 'hearing_scheduled'
  | 'hearing_completed'
  | 'decision_pending'
  | 'decided'
  | 'withdrawn';

export interface AppealOutcome {
  decision: 'allowed' | 'dismissed' | 'partly_allowed';
  summary: string;
  orders: string[];
  costs?: number;
  decisionDate: Date;
}

export interface LegalRepresentation {
  solicitor?: Professional;
  barrister?: Professional;
  firm?: string;
  costs: number;
  fundingType: 'private' | 'legal_aid' | 'insurance' | 'cfa';
}

// Utility Types
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface Location {
  address: Address;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string[];
  relatedEntity: string;
  entityType: 'child' | 'ehc_plan' | 'assessment' | 'appeal';
}

export interface SupportNetworkMember {
  id: string;
  userId: string;
  relationship: string;
  role: string;
  isEmergencyContact: boolean;
  permissions: string[];
}

export interface Intervention {
  id: string;
  childId: string;
  type: string;
  provider: string;
  startDate: Date;
  endDate?: Date;
  frequency: string;
  duration: string;
  goals: string[];
  progress: InterventionProgress[];
  cost: number;
  fundingSource: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'paused';
}

export interface InterventionProgress {
  date: Date;
  goals: Record<string, number>; // goal -> progress percentage
  notes: string;
  attachments?: string[];
  recordedBy: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  expiryDate: Date;
  coverageTypes: string[];
}

export interface EHCPlanTimeline {
  date: Date;
  event: string;
  description: string;
  source: 'la' | 'parent' | 'professional' | 'system';
  status: 'completed' | 'pending' | 'overdue';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  priorities?: string[];
  statuses?: string[];
  assignedTo?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
