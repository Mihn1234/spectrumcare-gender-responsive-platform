// Memory Database for SpectrumCare Platform
// Comprehensive autism support ecosystem with parent portal features

export interface User {
  id: string;
  email: string;
  password?: string; // Add password field for registration
  role: 'parent' | 'professional' | 'la-officer' | 'admin';
  isActive: boolean;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Child {
  id: string;
  parentUserId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  diagnosis?: string;
  needs: string[];
  schoolName?: string;
  yearGroup?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  uploadedBy: string;
  childId?: string;
  fileName: string;
  fileType: string;
  fileSize?: number; // Add fileSize field
  documentType: string;
  description?: string; // Add description field
  hasAiAnalysis: boolean;
  aiAnalysis?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface Assessment {
  id: string;
  childId: string;
  professionalId: string;
  type: string;
  assessmentType: string;
  status: string;
  scheduledDate: string;
  durationMinutes?: number; // Add durationMinutes field
  location?: string; // Add location field
  cost?: number; // Add cost field
  fundingSource?: string; // Add fundingSource field
  notes?: string; // Add notes field
  completedDate?: string;
  results?: any;
  createdAt: string;
}

export interface Professional {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  qualifications: string[];
  isVerified: boolean;
  rating: number;
  hourlyRate?: number; // Add hourlyRate field
  availableSlots: string[];
  whiteLabelSettings?: any;
  whiteLabel?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface AdultProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  employmentStatus?: string; // Add missing fields
  livingSituation?: string;
  independenceLevel?: string;
  communicationPreferences?: any;
  supportNeeds?: any;
  goals?: any[];
  financialSupport?: any;
  personalInfo: any;
  diagnosis: any;
  services: any;
  createdAt: string;
  updatedAt: string;
}

export interface EHCPlan {
  id: string;
  childProfileId: string;
  planStatus: string;
  localAuthority: string;
  dateOfPlan: string;
  dateOfNextReview: string;
  sections: any;
  outcomes: any[];
  provisions: any[];
  personalBudget?: number; // Add personalBudget field
  complianceChecks?: any; // Add complianceChecks field
  createdAt: string;
  updatedAt: string;
}

export interface ShadowPlan {
  id: string;
  planId: string;
  improvements: any;
  recommendations: string[];
  qualityScore?: number; // Add qualityScore field
  lastModified: string;
}

export interface ImportedPlan {
  id: string;
  userId: string;
  originalPlan: any;
  analysisResults: any;
  extractedData: any;
  planType: string;
  childId?: string;
  source?: string;
  fileName?: string;
  qualityScore?: number; // Add qualityScore field
  createdAt: string;
  updatedAt: string;
}

export interface GuestAccess {
  id: string;
  invitedBy: string;
  createdBy: string;
  guestEmail: string;
  professionalEmail: string;
  permissions: string[];
  status: string;
  expiresAt: string;
  accessToken: string;
  childId?: string;
  accessLevel: string;
  purpose: string;
  restrictions?: string[];
  usedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  planId: string;
  reviewType: string;
  scheduledDate: string;
  participants: any[];
  reviewStatus: string;
  outcomes?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  contentText: string;
  category: string;
  targetAudience: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  rating: number;
  createdAt: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  type: string;
  inputData: any;
  results: any;
  confidence: number;
  createdAt: string;
}

export interface FamilyRelationship {
  id: string;
  parentUserId: string;
  childId: string;
  relationship: string;
  permissions: string[];
  createdAt: string;
}

// Parent Portal Interfaces
export interface EHCComparison {
  id: string;
  childId: string;
  officialPlan?: any;
  shadowPlan?: any;
  comparisonAnalysis: {
    overallQuality: number;
    gapAnalysis: string[];
    recommendations: string[];
    costAnalysis: any;
    timelineComparison: any;
    outcomeComparison: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Crisis {
  id: string;
  childId: string;
  crisisType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggerFactors: string[];
  interventions: any[];
  emergencyContacts: any[];
  preventionPlan: any;
  recoveryPlan: any;
  isActive: boolean;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  analysis?: any;
}

export interface FinancialData {
  id: string;
  userId: string;
  childId: string;
  budgetType: string;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  budgetPeriod: string;
  expenditures: any[];
  outcomes: any[];
  providerPayments: any[];
  grantApplications: any[];
  calculatedMetrics?: any;
  createdAt: string;
  updatedAt: string;
}

export class MemoryDatabase {
  private users = new Map<string, User>();
  private children = new Map<string, Child>();
  private documents = new Map<string, Document>();
  private assessments = new Map<string, Assessment>();
  private professionals = new Map<string, Professional>();
  private adultProfiles = new Map<string, AdultProfile>();
  private ehcPlans = new Map<string, EHCPlan>();
  private shadowPlans = new Map<string, ShadowPlan>();
  private importedPlans = new Map<string, ImportedPlan>();
  private guestAccess = new Map<string, GuestAccess>();
  private reviews = new Map<string, Review>();
  private contentLibrary = new Map<string, ContentItem>();
  private analysisRecords = new Map<string, AnalysisRecord>();
  private familyRelationships = new Map<string, FamilyRelationship>();

  // Parent Portal Data
  private ehcPlanComparisons = new Map<string, EHCComparison>();
  private crisisManagement = new Map<string, Crisis>();
  private financialManagement = new Map<string, FinancialData>();
  private voiceAssistantSessions = new Map<string, any>();
  private professionalMarketplace = new Map<string, any>();

  constructor() {
    this.initializeSampleData();
  }

  // Utility Methods
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Statistics Methods
  async getParentPortalStats() {
    return {
      // Existing stats
      ...await this.getEnhancedStats(),

      // New parent portal stats
      totalEHCComparisons: this.ehcPlanComparisons.size,
      activeCrises: Array.from(this.crisisManagement.values()).filter(c => c.isActive).length,
      totalBudgetManaged: Array.from(this.financialManagement.values()).reduce((sum, f) => sum + f.totalBudget, 0),
      averageBudgetUtilization: this.calculateAverageBudgetUtilization(),
      activeTherapySessions: this.countActiveTherapySessions(),
      communityEngagement: this.calculateCommunityEngagement(),
      voiceAssistantUsage: Array.from(this.voiceAssistantSessions.values()).filter(s => s.isActive).length,
      professionalMarketplaceSize: this.professionalMarketplace.size,
      averageProfessionalRating: this.calculateAverageProfessionalRating()
    };
  }

  async getEnhancedStats() {
    const users = Array.from(this.users.values());
    const children = Array.from(this.children.values());
    const documents = Array.from(this.documents.values());
    const assessments = Array.from(this.assessments.values());
    const professionals = Array.from(this.professionals.values());

    return {
      totalUsers: users.length,
      totalChildren: children.length,
      totalDocuments: documents.length,
      totalAssessments: assessments.length,
      totalProfessionals: professionals.length,
      activeUsers: users.filter(u => u.isActive).length,
      verifiedProfessionals: professionals.filter(p => p.isVerified).length,
      documentsWithAI: documents.filter(d => d.aiAnalysis).length
    };
  }

  async getStats() {
    return await this.getEnhancedStats();
  }

  // Helper calculation methods
  calculateAverageBudgetUtilization(): number {
    const financialData = Array.from(this.financialManagement.values());
    if (financialData.length === 0) return 0;
    const totalUtilization = financialData.reduce((sum, f) => sum + (f.spentBudget / f.totalBudget) * 100, 0);
    return Math.round(totalUtilization / financialData.length);
  }

  countActiveTherapySessions(): number {
    return 8; // Mock data
  }

  calculateCommunityEngagement(): number {
    return 92; // Mock data
  }

  calculateAverageProfessionalRating(): number {
    const professionals = Array.from(this.professionals.values());
    if (professionals.length === 0) return 0;
    const totalRating = professionals.reduce((sum, p) => sum + p.rating, 0);
    return Math.round((totalRating / professionals.length) * 10) / 10;
  }

  // User Methods
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Simplified authentication for development
    // In production, this would verify password hash
    const user = await this.getUserByEmail(email);
    if (user && user.isActive) {
      return user;
    }
    return null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const id = this.generateId();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.users.set(userId, user);
    }
  }

  // Guest Access Methods - Remove duplicate implementations
  async getGuestAccessRecords(optionsOrUserId?: string | any, options?: any): Promise<GuestAccess[]> {
    let userId: string | undefined;
    let actualOptions: any = {};

    // Handle overloaded parameters
    if (typeof optionsOrUserId === 'string') {
      userId = optionsOrUserId;
      actualOptions = options || {};
    } else {
      actualOptions = optionsOrUserId || {};
    }

    const records: GuestAccess[] = [];
    for (const record of this.guestAccess.values()) {
      // Filter by user if specified
      if (userId && record.invitedBy !== userId) {
        continue;
      }

      // Filter by status if specified
      if (actualOptions.status && record.status !== actualOptions.status) {
        continue;
      }

      // Filter by childId if specified
      if (actualOptions.childId && record.childId !== actualOptions.childId) {
        continue;
      }

      records.push(record);
    }
    return records;
  }

  async getGuestAccessById(guestAccessId: string): Promise<GuestAccess | null> {
    return this.guestAccess.get(guestAccessId) || null;
  }

  async createGuestAccess(guestDataOrAccessData: Omit<GuestAccess, 'id' | 'createdAt'>): Promise<GuestAccess> {
    const id = this.generateId();
    const guest: GuestAccess = {
      ...guestDataOrAccessData,
      id,
      createdAt: new Date().toISOString()
    };
    this.guestAccess.set(id, guest);
    return guest;
  }

  async updateGuestAccess(guestAccessId: string, updateData: Partial<GuestAccess>): Promise<GuestAccess | null> {
    const guest = this.guestAccess.get(guestAccessId);
    if (!guest) return null;

    const updatedGuest = {
      ...guest,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.guestAccess.set(guestAccessId, updatedGuest);
    return updatedGuest;
  }

  // Child Methods
  async getChildById(childId: string): Promise<Child | null> {
    return this.children.get(childId) || null;
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    const children: Child[] = [];
    for (const child of this.children.values()) {
      if (child.parentUserId === parentId) {
        children.push(child);
      }
    }
    return children;
  }

  async createChild(childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>): Promise<Child> {
    const id = this.generateId();
    const child: Child = {
      ...childData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.children.set(id, child);
    return child;
  }

  async hasChildAccess(userId: string, childId: string): Promise<boolean> {
    const child = this.children.get(childId);
    if (!child) return false;

    // Parent has access to their children
    if (child.parentUserId === userId) return true;

    // Check for family relationships
    for (const relationship of this.familyRelationships.values()) {
      if (relationship.childId === childId && relationship.parentUserId === userId) {
        return true;
      }
    }

    return false;
  }

  // Document Methods
  async getDocumentById(documentId: string): Promise<Document | null> {
    return this.documents.get(documentId) || null;
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    const documents: Document[] = [];
    for (const document of this.documents.values()) {
      if (document.uploadedBy === userId) {
        documents.push(document);
      }
    }
    return documents;
  }

  async getDocumentsByChildId(childId: string): Promise<Document[]> {
    const documents: Document[] = [];
    for (const document of this.documents.values()) {
      if (document.childId === childId) {
        documents.push(document);
      }
    }
    return documents;
  }

  async createDocument(documentData: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
    const id = this.generateId();
    const document: Document = {
      ...documentData,
      id,
      createdAt: new Date().toISOString()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document) return null;

    const updatedDocument = {
      ...document,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.documents.set(documentId, updatedDocument);
    return updatedDocument;
  }

  async hasDocumentAccess(userId: string, documentId: string): Promise<boolean> {
    const document = this.documents.get(documentId);
    if (!document) return false;

    // User uploaded the document
    if (document.uploadedBy === userId) return true;

    // User has access to the child
    if (document.childId) {
      return await this.hasChildAccess(userId, document.childId);
    }

    return false;
  }

  // Professional Methods
  async getProfessionalById(professionalId: string): Promise<Professional | null> {
    return this.professionals.get(professionalId) || null;
  }

  async getProfessionalByUserId(userId: string): Promise<Professional | null> {
    for (const professional of this.professionals.values()) {
      if (professional.userId === userId) {
        return professional;
      }
    }
    return null;
  }

  async getAllProfessionals(): Promise<Professional[]> {
    return Array.from(this.professionals.values());
  }

  async updateProfessionalWhiteLabel(userId: string, updateData: any): Promise<Professional | null> {
    const professional = await this.getProfessionalByUserId(userId);
    if (!professional) return null;

    const updatedProfessional = {
      ...professional,
      whiteLabel: { ...professional.whiteLabel, ...updateData },
      updatedAt: new Date().toISOString()
    };
    this.professionals.set(professional.id, updatedProfessional);
    return updatedProfessional;
  }

  // Assessment Methods
  async getAssessmentsByUserId(userId: string): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    for (const assessment of this.assessments.values()) {
      // Check if user has access through child relationship
      if (await this.hasChildAccess(userId, assessment.childId)) {
        assessments.push(assessment);
      }
    }
    return assessments;
  }

  async createAssessment(assessmentData: Omit<Assessment, 'id' | 'createdAt'>): Promise<Assessment> {
    const id = this.generateId();
    const assessment: Assessment = {
      ...assessmentData,
      id,
      createdAt: new Date().toISOString()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  // Adult Profile Methods
  async getAdultProfileById(profileId: string): Promise<AdultProfile | null> {
    return this.adultProfiles.get(profileId) || null;
  }

  async getAdultProfilesByUserId(userId: string): Promise<AdultProfile[]> {
    const profiles: AdultProfile[] = [];
    for (const profile of this.adultProfiles.values()) {
      if (profile.userId === userId) {
        profiles.push(profile);
      }
    }
    return profiles;
  }

  async createAdultProfile(profileData: Omit<AdultProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdultProfile> {
    const id = this.generateId();
    const profile: AdultProfile = {
      ...profileData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.adultProfiles.set(id, profile);
    return profile;
  }

  async updateAdultProfile(profileId: string, updateData: Partial<AdultProfile>): Promise<AdultProfile | null> {
    const profile = this.adultProfiles.get(profileId);
    if (!profile) return null;

    const updatedProfile = {
      ...profile,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.adultProfiles.set(profileId, updatedProfile);
    return updatedProfile;
  }

  async deleteAdultProfile(profileId: string): Promise<boolean> {
    return this.adultProfiles.delete(profileId);
  }

  // EHC Plan Methods
  async getEHCPlanById(planId: string): Promise<EHCPlan | null> {
    return this.ehcPlans.get(planId) || null;
  }

  async getEHCPlansByUserId(userId: string, options?: any): Promise<EHCPlan[]> {
    const plans: EHCPlan[] = [];
    for (const plan of this.ehcPlans.values()) {
      if (await this.hasChildAccess(userId, plan.childProfileId)) {
        if (!options?.childId || plan.childProfileId === options.childId) {
          if (!options?.status || plan.planStatus === options.status) {
            plans.push(plan);
          }
        }
      }
    }
    return plans;
  }

  async getEHCPlansByAuthority(authority: string, options?: any): Promise<EHCPlan[]> {
    const plans: EHCPlan[] = [];
    for (const plan of this.ehcPlans.values()) {
      if (plan.localAuthority === authority) {
        if (!options?.childId || plan.childProfileId === options.childId) {
          if (!options?.status || plan.planStatus === options.status) {
            plans.push(plan);
          }
        }
      }
    }
    return plans;
  }

  async getAllEHCPlans(options?: any): Promise<EHCPlan[]> {
    const plans = Array.from(this.ehcPlans.values());
    return plans.filter(plan => {
      if (options?.childId && plan.childProfileId !== options.childId) return false;
      if (options?.status && plan.planStatus !== options.status) return false;
      return true;
    });
  }

  async getPlanCountByAuthority(authority: string): Promise<number> {
    let count = 0;
    for (const plan of this.ehcPlans.values()) {
      if (plan.localAuthority === authority) {
        count++;
      }
    }
    return count;
  }

  async createEHCPlan(planData: Omit<EHCPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<EHCPlan> {
    const id = this.generateId();
    const plan: EHCPlan = {
      ...planData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.ehcPlans.set(id, plan);
    return plan;
  }

  async createShadowPlan(planId: string, shadowData: any): Promise<ShadowPlan> {
    const id = this.generateId();
    const shadowPlan: ShadowPlan = {
      id,
      planId,
      ...shadowData,
      lastModified: new Date().toISOString()
    };
    this.shadowPlans.set(id, shadowPlan);
    return shadowPlan;
  }

  async updateEHCPlanStatus(planId: string, status: string, userId: string): Promise<EHCPlan | null> {
    const plan = this.ehcPlans.get(planId);
    if (!plan) return null;

    plan.planStatus = status;
    plan.updatedAt = new Date().toISOString();
    this.ehcPlans.set(planId, plan);
    return plan;
  }

  async scheduleEHCPlanReview(planId: string, reviewDate: string, userId: string): Promise<EHCPlan | null> {
    const plan = this.ehcPlans.get(planId);
    if (!plan) return null;

    plan.dateOfNextReview = reviewDate;
    plan.updatedAt = new Date().toISOString();
    this.ehcPlans.set(planId, plan);
    return plan;
  }

  async transferEHCPlan(planId: string, newAuthority: string, userId: string): Promise<EHCPlan | null> {
    const plan = this.ehcPlans.get(planId);
    if (!plan) return null;

    plan.localAuthority = newAuthority;
    plan.updatedAt = new Date().toISOString();
    this.ehcPlans.set(planId, plan);
    return plan;
  }

  async runComplianceCheck(planId: string, userId: string): Promise<any> {
    const plan = this.ehcPlans.get(planId);
    if (!plan) return null;

    // Simulate compliance check
    return {
      overallScore: 85,
      sectionsChecked: 10,
      issuesFound: 2,
      recommendations: [
        'Add more specific success criteria to outcomes',
        'Include transition planning details'
      ],
      complianceStatus: 'Good',
      lastChecked: new Date().toISOString()
    };
  }

  // Imported Plan Methods
  async getImportedPlanById(planId: string): Promise<ImportedPlan | null> {
    return this.importedPlans.get(planId) || null;
  }

  async getImportedPlansByUserId(userId: string): Promise<ImportedPlan[]> {
    const plans: ImportedPlan[] = [];
    for (const plan of this.importedPlans.values()) {
      if (plan.userId === userId) {
        plans.push(plan);
      }
    }
    return plans;
  }

  async createImportedPlan(planData: Omit<ImportedPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImportedPlan> {
    const id = this.generateId();
    const plan: ImportedPlan = {
      ...planData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.importedPlans.set(id, plan);
    return plan;
  }

  // Review Methods
  async getUpcomingReviews(): Promise<Review[]> {
    const now = new Date();
    return Array.from(this.reviews.values()).filter(review =>
      new Date(review.scheduledDate) > now && review.reviewStatus === 'scheduled'
    );
  }

  async getOverdueReviews(): Promise<Review[]> {
    const now = new Date();
    return Array.from(this.reviews.values()).filter(review =>
      new Date(review.scheduledDate) < now && review.reviewStatus === 'scheduled'
    );
  }

  async getReviewsByPlanId(planId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.planId === planId);
  }

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    const id = this.generateId();
    const review: Review = {
      ...reviewData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(reviewId: string, updateData: Partial<Review>): Promise<Review | null> {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    const updatedReview = {
      ...review,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.reviews.set(reviewId, updatedReview);
    return updatedReview;
  }

  // Content Methods
  async getFeaturedContent(audience?: string): Promise<ContentItem[]> {
    const content: ContentItem[] = [];
    for (const item of this.contentLibrary.values()) {
      if (item.isFeatured && item.isPublished) {
        if (!audience || item.targetAudience === audience || item.targetAudience === 'all') {
          content.push(item);
        }
      }
    }
    return content;
  }

  async searchContent(query: string, audience?: string): Promise<ContentItem[]> {
    const content: ContentItem[] = [];
    const searchQuery = query.toLowerCase();

    for (const item of this.contentLibrary.values()) {
      if (item.isPublished) {
        const matchesQuery =
          item.title.toLowerCase().includes(searchQuery) ||
          item.contentText.toLowerCase().includes(searchQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchQuery));

        const matchesAudience = !audience ||
          item.targetAudience === audience ||
          item.targetAudience === 'all';

        if (matchesQuery && matchesAudience) {
          content.push(item);
        }
      }
    }
    return content;
  }

  async getContentByCategory(category: string, audience?: string): Promise<ContentItem[]> {
    const content: ContentItem[] = [];
    for (const item of this.contentLibrary.values()) {
      if (item.isPublished) {
        const matchesCategory = !category || item.category === category;
        const matchesAudience = !audience ||
          item.targetAudience === audience ||
          item.targetAudience === 'all';

        if (matchesCategory && matchesAudience) {
          content.push(item);
        }
      }
    }
    return content;
  }

  async getContentById(contentId: string): Promise<ContentItem | null> {
    return this.contentLibrary.get(contentId) || null;
  }

  async incrementContentView(contentId: string): Promise<void> {
    const content = this.contentLibrary.get(contentId);
    if (content) {
      content.viewCount++;
      this.contentLibrary.set(contentId, content);
    }
  }

  // Analysis Methods
  async createAnalysisRecord(analysisData: Omit<AnalysisRecord, 'id' | 'createdAt'>): Promise<AnalysisRecord> {
    const id = this.generateId();
    const record: AnalysisRecord = {
      ...analysisData,
      id,
      createdAt: new Date().toISOString()
    };
    this.analysisRecords.set(id, record);
    return record;
  }

  async getAnalysisHistory(userId: string, options?: any): Promise<AnalysisRecord[]> {
    const records: AnalysisRecord[] = [];
    for (const record of this.analysisRecords.values()) {
      if (record.userId === userId) {
        if (!options?.type || record.type === options.type) {
          records.push(record);
        }
      }
    }
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Parent Portal Methods
  async getEHCComparison(childId: string): Promise<EHCComparison | null> {
    for (const comparison of this.ehcPlanComparisons.values()) {
      if (comparison.childId === childId) {
        return comparison;
      }
    }
    return null;
  }

  async createEHCComparison(comparisonData: Omit<EHCComparison, 'id' | 'createdAt' | 'updatedAt'>): Promise<EHCComparison> {
    const id = this.generateId();
    const comparison: EHCComparison = {
      ...comparisonData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.ehcPlanComparisons.set(id, comparison);
    return comparison;
  }

  async getCrisisByChildId(childId: string): Promise<Crisis[]> {
    const crises: Crisis[] = [];
    for (const crisis of this.crisisManagement.values()) {
      if (crisis.childId === childId) {
        crises.push(crisis);
      }
    }
    return crises;
  }

  async createCrisis(crisisData: Omit<Crisis, 'id' | 'createdAt' | 'updatedAt'>): Promise<Crisis> {
    const id = this.generateId();
    const crisis: Crisis = {
      ...crisisData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.crisisManagement.set(id, crisis);
    return crisis;
  }

  async updateCrisis(crisisId: string, updateData: Partial<Crisis>): Promise<Crisis | null> {
    const crisis = this.crisisManagement.get(crisisId);
    if (!crisis) return null;

    const updatedCrisis = {
      ...crisis,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.crisisManagement.set(crisisId, updatedCrisis);
    return updatedCrisis;
  }

  async getFinancialDataByChildId(childId: string): Promise<FinancialData | null> {
    for (const data of this.financialManagement.values()) {
      if (data.childId === childId) {
        return data;
      }
    }
    return null;
  }

  async createFinancialData(financialData: Omit<FinancialData, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialData> {
    const id = this.generateId();
    const data: FinancialData = {
      ...financialData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.financialManagement.set(id, data);
    return data;
  }

  async updateFinancialData(dataId: string, updateData: Partial<FinancialData>): Promise<FinancialData | null> {
    const data = this.financialManagement.get(dataId);
    if (!data) return null;

    const updatedData = {
      ...data,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.financialManagement.set(dataId, updatedData);
    return updatedData;
  }

  // Method aliases for backward compatibility
  async getEHCPlanComparison(childId: string): Promise<EHCComparison | null> {
    return this.getEHCComparison(childId);
  }

  async createEHCPlanComparison(comparisonData: Omit<EHCComparison, 'id' | 'createdAt' | 'updatedAt'>): Promise<EHCComparison> {
    return this.createEHCComparison(comparisonData);
  }

  async getFinancialManagementByChildId(childId: string): Promise<FinancialData | null> {
    return this.getFinancialDataByChildId(childId);
  }

  async createFinancialManagement(financialData: Omit<FinancialData, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialData> {
    return this.createFinancialData(financialData);
  }

  async updateFinancialManagement(dataId: string, updateData: Partial<FinancialData>): Promise<FinancialData | null> {
    return this.updateFinancialData(dataId, updateData);
  }

  // Initialize Sample Data
  private initializeSampleData() {
    // Sample users
    this.users.set('user-1', {
      id: 'user-1',
      email: 'parent@test.com',
      role: 'parent',
      isActive: true,
      firstName: 'Sarah',
      lastName: 'Johnson',
      createdAt: new Date().toISOString()
    });

    this.users.set('user-2', {
      id: 'user-2',
      email: 'professional@test.com',
      role: 'professional',
      isActive: true,
      firstName: 'Dr. Emily',
      lastName: 'Smith',
      createdAt: new Date().toISOString()
    });

    // Sample children
    this.children.set('demo-child-id', {
      id: 'demo-child-id',
      parentUserId: 'user-1',
      firstName: 'Alex',
      lastName: 'Johnson',
      dateOfBirth: '2015-05-15',
      diagnosis: 'Autism Spectrum Disorder',
      needs: ['Communication support', 'Sensory processing', 'Social skills'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Sample professionals
    this.professionals.set('prof-1', {
      id: 'prof-1',
      userId: 'user-2',
      specialization: 'Speech and Language Therapy',
      qualifications: ['RCSLT', 'MSc SLT'],
      isVerified: true,
      rating: 4.8,
      hourlyRate: 100,
      availableSlots: ['2024-02-01T10:00:00Z', '2024-02-01T14:00:00Z'],
      createdAt: new Date().toISOString()
    });

    // Sample documents
    this.documents.set('doc-1', {
      id: 'doc-1',
      uploadedBy: 'user-1',
      childId: 'demo-child-id',
      fileName: 'assessment-report.pdf',
      fileType: 'application/pdf',
      documentType: 'assessment',
      hasAiAnalysis: true,
      aiAnalysis: {
        confidence: 92,
        keyPoints: ['Speech delay identified', 'Sensory processing differences noted'],
        recommendations: ['Increase speech therapy sessions', 'Sensory diet implementation']
      },
      createdAt: new Date().toISOString()
    });

    // Sample EHC comparison
    this.ehcPlanComparisons.set('comp-1', {
      id: 'comp-1',
      childId: 'demo-child-id',
      comparisonAnalysis: {
        overallQuality: 75,
        gapAnalysis: [
          'Section H (Health) lacks specific therapy provisions',
          'Outcomes are not SMART enough',
          'Transition planning is missing'
        ],
        recommendations: [
          'Add weekly speech therapy provision',
          'Include specific communication outcome targets',
          'Develop comprehensive transition plan for secondary school'
        ],
        costAnalysis: {
          currentPlanCost: 12500,
          shadowPlanCost: 15800,
          costBenefitRatio: 1.3
        },
        timelineComparison: {
          currentTimeline: '18-24 months',
          optimizedTimeline: '12-18 months'
        },
        outcomeComparison: {
          currentOutcomes: 4,
          optimizedOutcomes: 7
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Sample crisis data
    this.crisisManagement.set('crisis-1', {
      id: 'crisis-1',
      childId: 'demo-child-id',
      crisisType: 'School Refusal',
      severity: 'medium',
      triggerFactors: ['Change in routine', 'Noise sensitivity', 'Social anxiety'],
      interventions: [
        { type: 'Environmental', action: 'Reduce sensory stimulation', effectiveness: 'High' },
        { type: 'Behavioral', action: 'Visual schedule implementation', effectiveness: 'Medium' }
      ],
      emergencyContacts: [
        { name: 'Sarah Johnson', role: 'Mother', phone: '+44123456789', priority: 1 }
      ],
      preventionPlan: {
        strategies: ['Daily visual schedule', 'Sensory breaks', 'Advance notice of changes'],
        effectiveness: 85
      },
      recoveryPlan: {
        steps: ['Calm environment', 'Preferred activity', 'Gradual re-engagement'],
        timeframe: '30-60 minutes'
      },
      isActive: false,
      resolvedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Sample financial data
    this.financialManagement.set('finance-1', {
      id: 'finance-1',
      userId: 'user-1',
      childId: 'demo-child-id',
      budgetType: 'Personal Budget',
      totalBudget: 15000,
      allocatedBudget: 12000,
      spentBudget: 8500,
      remainingBudget: 6500,
      budgetPeriod: 'Annual 2024',
      expenditures: [
        {
          provider: 'Speech Therapy Clinic',
          amount: 2400,
          category: 'therapy',
          outcome: 'Improved verbal communication',
          date: '2024-01-15'
        },
        {
          provider: 'Occupational Therapy Services',
          amount: 1800,
          category: 'therapy',
          outcome: 'Better sensory regulation',
          date: '2024-01-20'
        }
      ],
      outcomes: [
        {
          description: 'Improved verbal communication',
          measurement: '50% increase in spontaneous speech',
          costPerOutcome: 2400,
          qualityRating: 5,
          achievedDate: '2024-01-30'
        }
      ],
      providerPayments: [],
      grantApplications: [
        {
          grantName: 'Family Fund Grant',
          amount: 3000,
          purpose: 'Additional therapy support',
          status: 'pending',
          applicationDate: '2024-01-10'
        }
      ],
      calculatedMetrics: {
        budgetUtilization: 57,
        averageMonthlySpend: 2125,
        remainingMonths: 4,
        categoryBreakdown: [
          { category: 'therapy', amount: 4200, percentage: 49.4 },
          { category: 'equipment', amount: 2800, percentage: 32.9 },
          { category: 'transport', amount: 1500, percentage: 17.6 }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Sample content
    this.contentLibrary.set('content-1', {
      id: 'content-1',
      title: 'Understanding EHC Plans',
      contentText: 'A comprehensive guide to Education, Health and Care plans...',
      category: 'education',
      targetAudience: 'parents',
      tags: ['EHC', 'education', 'planning'],
      isFeatured: true,
      isPublished: true,
      viewCount: 245,
      rating: 4.7,
      createdAt: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const memoryDatabase = new MemoryDatabase();
