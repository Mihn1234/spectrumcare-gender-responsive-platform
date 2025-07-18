import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';
import { authenticateRequest } from '@/lib/auth-helpers';
import { z } from 'zod';

// Validation schemas
const communityQuerySchema = z.object({
  type: z.enum(['overview', 'groups', 'messages', 'mentorship', 'events', 'directory']).optional(),
  groupId: z.string().optional(),
  messageThreadId: z.string().optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  ageRange: z.string().optional(),
  supportType: z.string().optional()
});

const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  groupType: z.enum(['support', 'activity', 'educational', 'social', 'crisis']),
  privacy: z.enum(['public', 'private', 'invite-only']),
  maxMembers: z.number().min(2).max(500).optional(),
  location: z.string().optional(),
  ageRange: z.string().optional(),
  interests: z.array(z.string()),
  moderationLevel: z.enum(['light', 'moderate', 'strict']).optional(),
  requiresApproval: z.boolean().optional()
});

const sendMessageSchema = z.object({
  recipientId: z.string().optional(),
  groupId: z.string().optional(),
  threadId: z.string().optional(),
  messageType: z.enum(['text', 'voice', 'image', 'document', 'crisis', 'support-request']),
  content: z.string().min(1).max(5000),
  isAnonymous: z.boolean().optional(),
  parentalGuidance: z.boolean().optional(),
  contentWarning: z.boolean().optional(),
  sensitiveContent: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

const matchmakingRequestSchema = z.object({
  matchType: z.enum(['friendship', 'support-buddy', 'mentor', 'activity-partner', 'crisis-support']),
  preferences: z.object({
    location: z.string().optional(),
    radius: z.number().min(1).max(100).optional(),
    ageRange: z.string().optional(),
    childAgeRange: z.string().optional(),
    interests: z.array(z.string()),
    supportNeeds: z.array(z.string()),
    communicationStyle: z.enum(['text', 'voice', 'video', 'in-person', 'any']).optional(),
    availability: z.array(z.string()).optional(),
    experienceLevel: z.enum(['new', 'experienced', 'expert', 'any']).optional()
  }),
  privacySettings: z.object({
    shareLocation: z.boolean(),
    shareContact: z.boolean(),
    shareChildInfo: z.boolean(),
    allowDirectMessages: z.boolean(),
    requireVerification: z.boolean()
  })
});

const mentorshipSchema = z.object({
  role: z.enum(['mentor', 'mentee']),
  expertise: z.array(z.string()),
  availability: z.object({
    timeSlots: z.array(z.string()),
    frequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'as-needed']),
    duration: z.number().min(30).max(180)
  }),
  preferences: z.object({
    age: z.string().optional(),
    experience: z.string().optional(),
    location: z.string().optional(),
    communicationMode: z.enum(['text', 'voice', 'video', 'in-person'])
  }),
  backgroundCheck: z.boolean().optional()
});

const eventSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  eventType: z.enum(['meetup', 'workshop', 'support-group', 'social', 'educational', 'fundraising']),
  location: z.object({
    venue: z.string().optional(),
    address: z.string().optional(),
    online: z.boolean(),
    meetingLink: z.string().optional()
  }),
  datetime: z.string(),
  duration: z.number().min(30).max(480),
  maxAttendees: z.number().min(2).max(1000).optional(),
  ageRestrictions: z.string().optional(),
  cost: z.number().min(0).optional(),
  requiresBooking: z.boolean(),
  accessibility: z.array(z.string()).optional(),
  tags: z.array(z.string())
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryData = {
      type: searchParams.get('type') || 'overview',
      groupId: searchParams.get('groupId'),
      messageThreadId: searchParams.get('messageThreadId'),
      location: searchParams.get('location'),
      interests: searchParams.get('interests')?.split(','),
      ageRange: searchParams.get('ageRange'),
      supportType: searchParams.get('supportType')
    };

    // Validate query parameters
    const validatedQuery = communityQuerySchema.parse(queryData);

    switch (validatedQuery.type) {
      case 'overview':
        return await getCommunityOverview(authResult.user.id);

      case 'groups':
        return await getSupportGroups(authResult.user.id, validatedQuery);

      case 'messages':
        return await getMessages(authResult.user.id, validatedQuery);

      case 'mentorship':
        return await getMentorshipProgram(authResult.user.id);

      case 'events':
        return await getCommunityEvents(authResult.user.id, validatedQuery);

      case 'directory':
        return await getCommunityDirectory(authResult.user.id, validatedQuery);

      default:
        return await getCommunityOverview(authResult.user.id);
    }

  } catch (error: any) {
    console.error('Community support GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch community data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_group':
        return await createSupportGroup(authResult.user.id, data);

      case 'join_group':
        return await joinSupportGroup(authResult.user.id, data);

      case 'send_message':
        return await sendMessage(authResult.user.id, data);

      case 'request_matchmaking':
        return await requestMatchmaking(authResult.user.id, data);

      case 'apply_mentorship':
        return await applyMentorship(authResult.user.id, data);

      case 'create_event':
        return await createEvent(authResult.user.id, data);

      case 'report_content':
        return await reportContent(authResult.user.id, data);

      case 'update_privacy':
        return await updatePrivacySettings(authResult.user.id, data);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('Community support POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process community action' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getCommunityOverview(userId: string) {
  const overview = {
    userProfile: {
      id: userId,
      communityRank: 'Active Member',
      joinedDate: '2024-01-15',
      contributionScore: 847,
      helpedFamilies: 23,
      groupsMember: 4,
      messagesExchanged: 156,
      mentorshipMatches: 2,
      eventsAttended: 7,
      safetyRating: 'Excellent',
      verificationStatus: 'Verified Parent'
    },

    communityStats: {
      totalMembers: 12847,
      activeFamilies: 2635,
      supportGroups: 287,
      monthlyMessages: 15678,
      successfulMatches: 1823,
      mentoringPairs: 456,
      eventsThisMonth: 43,
      averageResponseTime: '1.2 hours',
      satisfactionRating: 4.8,
      safetyIncidents: 0
    },

    recentActivity: [
      {
        type: 'message',
        content: 'New message in "Autism Mums London"',
        timestamp: '2 hours ago',
        priority: 'medium'
      },
      {
        type: 'match',
        content: 'You have a potential support buddy match!',
        timestamp: '5 hours ago',
        priority: 'high'
      },
      {
        type: 'event',
        content: 'Sensory Play Workshop this Saturday',
        timestamp: '1 day ago',
        priority: 'medium'
      },
      {
        type: 'group',
        content: 'Invited to join "ADHD & Autism Support"',
        timestamp: '2 days ago',
        priority: 'low'
      }
    ],

    suggestedConnections: [
      {
        id: 'user-234',
        name: 'Sarah M.',
        type: 'Support Buddy',
        matchScore: 94,
        commonInterests: ['Sensory Processing', 'School Support', 'North London'],
        childAges: ['7 years'],
        distance: '2.3 miles',
        verificationStatus: 'Verified',
        lastActive: '1 hour ago'
      },
      {
        id: 'user-567',
        name: 'Emma T.',
        type: 'Activity Partner',
        matchScore: 87,
        commonInterests: ['Swimming', 'Weekend Activities', 'Social Skills'],
        childAges: ['6 years', '9 years'],
        distance: '4.1 miles',
        verificationStatus: 'Verified',
        lastActive: '3 hours ago'
      },
      {
        id: 'mentor-123',
        name: 'Dr. Rachel K.',
        type: 'Mentor',
        matchScore: 91,
        expertise: ['Educational Transitions', 'IEP Planning', 'Advocacy'],
        experience: '15+ years',
        availability: 'Weekly sessions',
        verificationStatus: 'Professional',
        lastActive: '30 minutes ago'
      }
    ],

    activeGroups: [
      {
        id: 'group-1',
        name: 'Autism Mums London',
        type: 'support',
        members: 156,
        newMessages: 8,
        lastActivity: '15 minutes ago',
        privacy: 'private',
        role: 'member'
      },
      {
        id: 'group-2',
        name: 'Sensory Solutions',
        type: 'educational',
        members: 89,
        newMessages: 3,
        lastActivity: '2 hours ago',
        privacy: 'public',
        role: 'moderator'
      },
      {
        id: 'group-3',
        name: 'Weekend Adventures',
        type: 'activity',
        members: 67,
        newMessages: 12,
        lastActivity: '45 minutes ago',
        privacy: 'public',
        role: 'member'
      }
    ],

    upcomingEvents: [
      {
        id: 'event-1',
        title: 'Sensory Play Workshop',
        type: 'workshop',
        date: '2024-02-17T10:00:00Z',
        location: 'North London Community Centre',
        attendees: 23,
        maxAttendees: 30,
        cost: 'Free',
        organizer: 'Sensory Solutions Group'
      },
      {
        id: 'event-2',
        title: 'Family Swimming Session',
        type: 'social',
        date: '2024-02-18T14:00:00Z',
        location: 'Aqua Centre',
        attendees: 12,
        maxAttendees: 20,
        cost: '£5 per family',
        organizer: 'Weekend Adventures'
      }
    ],

    safetyFeatures: {
      aiModeration: 'Active',
      backgroundChecks: 'Verified Members Only',
      reportingSystem: '24/7 Available',
      privacyControls: 'Granular Settings',
      emergencySupport: 'Direct Line Available',
      childProtection: 'Enhanced Protocols'
    },

    quickActions: [
      {
        action: 'find_support_buddy',
        title: 'Find Support Buddy',
        description: 'Connect with parents in similar situations',
        icon: 'Users'
      },
      {
        action: 'join_group',
        title: 'Discover Groups',
        description: 'Find local and online support communities',
        icon: 'Users'
      },
      {
        action: 'find_mentor',
        title: 'Find Mentor',
        description: 'Connect with experienced autism parents',
        icon: 'UserCheck'
      },
      {
        action: 'create_event',
        title: 'Create Event',
        description: 'Organize meetups and activities',
        icon: 'Calendar'
      }
    ]
  };

  return NextResponse.json({
    success: true,
    data: overview
  });
}

async function getSupportGroups(userId: string, filters: any) {
  // Simulate AI-powered group recommendations
  const groups = [
    {
      id: 'group-1',
      name: 'Autism Mums London',
      description: 'Supportive community for mothers of autistic children in London. Share experiences, ask questions, and find friendship.',
      type: 'support',
      privacy: 'private',
      location: 'London',
      members: 156,
      activeMembers: 89,
      messagesPerDay: 23,
      createdDate: '2023-06-15',
      moderators: ['Sarah Wilson', 'Emma Thompson'],
      rules: [
        'Respectful communication always',
        'No medical advice - seek professional help',
        'Keep children\'s privacy protected',
        'Support, don\'t judge'
      ],
      tags: ['support', 'mothers', 'london', 'community'],
      ageRange: '0-18 years',
      meetingFrequency: 'Weekly online, Monthly in-person',
      verificationRequired: true,
      matchScore: 96,
      joinStatus: 'member',
      lastActivity: '15 minutes ago',
      recentTopics: [
        'School transition support',
        'Sensory friendly activities',
        'ADHD & Autism overlap'
      ]
    },
    {
      id: 'group-2',
      name: 'Sensory Solutions',
      description: 'Educational group focused on sensory processing challenges and solutions. Share strategies, products, and success stories.',
      type: 'educational',
      privacy: 'public',
      location: 'UK Wide',
      members: 289,
      activeMembers: 167,
      messagesPerDay: 45,
      createdDate: '2023-03-22',
      moderators: ['Dr. Rachel Smith (OT)', 'Mark Johnson'],
      rules: [
        'Evidence-based strategies only',
        'Share experiences respectfully',
        'No product promotion without approval',
        'Credit original sources'
      ],
      tags: ['sensory', 'education', 'strategies', 'occupational-therapy'],
      ageRange: 'All ages',
      meetingFrequency: 'Bi-weekly workshops',
      verificationRequired: false,
      matchScore: 92,
      joinStatus: 'moderator',
      lastActivity: '2 hours ago',
      recentTopics: [
        'Sensory diets for home',
        'Weighted blanket effectiveness',
        'Sensory room setup'
      ]
    },
    {
      id: 'group-3',
      name: 'Weekend Adventures',
      description: 'Active families organizing autism-friendly outings and activities across London. Making weekends special for our children.',
      type: 'activity',
      privacy: 'public',
      location: 'Greater London',
      members: 124,
      activeMembers: 78,
      messagesPerDay: 18,
      createdDate: '2023-09-10',
      moderators: ['James Mitchell', 'Lisa Parker'],
      rules: [
        'Family-friendly activities only',
        'Book activities in advance',
        'Respect venue guidelines',
        'Share photos with consent only'
      ],
      tags: ['activities', 'outings', 'weekends', 'family-fun'],
      ageRange: '3-16 years',
      meetingFrequency: 'Weekly activities',
      verificationRequired: true,
      matchScore: 88,
      joinStatus: 'member',
      lastActivity: '45 minutes ago',
      recentTopics: [
        'Museum quiet hours',
        'Swimming session feedback',
        'Nature walks in Richmond'
      ]
    },
    {
      id: 'group-4',
      name: 'Teenage Autism Support',
      description: 'Dedicated support for parents of autistic teenagers. Navigate secondary school, social challenges, and transition planning.',
      type: 'support',
      privacy: 'private',
      location: 'UK Wide',
      members: 203,
      activeMembers: 134,
      messagesPerDay: 31,
      createdDate: '2023-01-18',
      moderators: ['Dr. Helen Carter', 'Sarah Johnson', 'Mike Roberts'],
      rules: [
        'Confidentiality is paramount',
        'Respectful debate encouraged',
        'Professional advice welcome',
        'Age-appropriate discussions'
      ],
      tags: ['teenagers', 'secondary-school', 'transitions', 'adolescence'],
      ageRange: '11-18 years',
      meetingFrequency: 'Monthly video calls',
      verificationRequired: true,
      matchScore: 85,
      joinStatus: 'eligible',
      lastActivity: '1 hour ago',
      recentTopics: [
        'GCSE accommodations',
        'Social anxiety strategies',
        'College preparation'
      ]
    }
  ];

  // Apply filters
  let filteredGroups = groups;

  if (filters.location) {
    filteredGroups = filteredGroups.filter(group =>
      group.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  if (filters.supportType) {
    filteredGroups = filteredGroups.filter(group =>
      group.type === filters.supportType
    );
  }

  // Generate recommendations
  const recommendations = await generateGroupRecommendations(userId, filteredGroups);

  return NextResponse.json({
    success: true,
    data: {
      groups: filteredGroups,
      recommendations,
      totalGroups: groups.length,
      userGroups: filteredGroups.filter(g => g.joinStatus === 'member' || g.joinStatus === 'moderator').length,
      analytics: {
        averageResponseTime: '2.3 hours',
        memberSatisfaction: 4.7,
        activeDiscussions: 23,
        newGroupsThisMonth: 5
      }
    }
  });
}

async function getMessages(userId: string, filters: any) {
  // Simulate secure messaging system
  const messageThreads = [
    {
      id: 'thread-1',
      type: 'direct',
      participants: [
        { id: userId, name: 'You', avatar: '/avatars/you.jpg' },
        { id: 'user-234', name: 'Sarah M.', avatar: '/avatars/sarah.jpg', verified: true }
      ],
      lastMessage: {
        content: 'Thanks for the sensory toy recommendation! Emma loves it.',
        timestamp: '2024-02-10T14:30:00Z',
        senderId: 'user-234',
        isRead: false
      },
      messageCount: 23,
      isEncrypted: true,
      privacy: 'high'
    },
    {
      id: 'thread-2',
      type: 'group',
      groupId: 'group-1',
      groupName: 'Autism Mums London',
      participants: [
        { id: userId, name: 'You', avatar: '/avatars/you.jpg' },
        { id: 'user-345', name: 'Emma T.', avatar: '/avatars/emma.jpg', verified: true },
        { id: 'user-456', name: 'Lisa P.', avatar: '/avatars/lisa.jpg', verified: true }
      ],
      lastMessage: {
        content: 'Has anyone tried the new sensory centre in Islington?',
        timestamp: '2024-02-10T16:45:00Z',
        senderId: 'user-345',
        isRead: true
      },
      messageCount: 167,
      newMessages: 8,
      isEncrypted: true,
      privacy: 'group',
      moderationLevel: 'moderate'
    }
  ];

  if (filters.messageThreadId) {
    const thread = messageThreads.find(t => t.id === filters.messageThreadId);
    if (thread) {
      const messages = await getThreadMessages(filters.messageThreadId);
      return NextResponse.json({
        success: true,
        data: {
          thread,
          messages
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      threads: messageThreads,
      unreadCount: messageThreads.reduce((sum, thread) =>
        sum + (thread.type === 'group' ? thread.newMessages || 0 : (thread.lastMessage.isRead ? 0 : 1)), 0
      ),
      analytics: {
        avgResponseTime: '1.2 hours',
        messagesSentThisWeek: 47,
        connectionsStrength: 'Strong',
        privacyScore: 'Excellent'
      }
    }
  });
}

async function getThreadMessages(threadId: string) {
  // Simulate encrypted message history
  return [
    {
      id: 'msg-1',
      content: 'Hi! I saw your post about sensory toys. My daughter has similar preferences.',
      senderId: 'user-234',
      senderName: 'Sarah M.',
      timestamp: '2024-02-09T10:15:00Z',
      messageType: 'text',
      isEncrypted: true,
      reactions: [],
      isModerated: true
    },
    {
      id: 'msg-2',
      content: 'Oh fantastic! What age is your daughter? Emma is 6 and really struggles with texture.',
      senderId: 'current-user',
      senderName: 'You',
      timestamp: '2024-02-09T10:18:00Z',
      messageType: 'text',
      isEncrypted: true,
      reactions: [],
      isModerated: true
    },
    {
      id: 'msg-3',
      content: 'She\'s 7. I found these amazing textured balls on Amazon - would you like the link?',
      senderId: 'user-234',
      senderName: 'Sarah M.',
      timestamp: '2024-02-09T10:22:00Z',
      messageType: 'text',
      isEncrypted: true,
      reactions: [{ emoji: '👍', userId: 'current-user' }],
      isModerated: true
    }
  ];
}

async function getMentorshipProgram(userId: string) {
  const mentorshipData = {
    userStatus: {
      role: 'mentee',
      activeMentorships: 1,
      completedMentorships: 0,
      applicationStatus: 'approved',
      verificationLevel: 'basic',
      mentoringScore: null,
      feedback: []
    },

    currentMentorship: {
      id: 'mentorship-1',
      mentor: {
        id: 'mentor-123',
        name: 'Dr. Rachel K.',
        title: 'Educational Psychologist & Autism Parent',
        experience: '15+ years',
        specialties: ['Educational Transitions', 'IEP Planning', 'Advocacy', 'Behavior Support'],
        rating: 4.9,
        sessionsCompleted: 134,
        verificationLevel: 'professional',
        background: 'NHS Educational Psychologist with personal experience supporting autistic child through primary and secondary education.'
      },
      schedule: {
        frequency: 'weekly',
        nextSession: '2024-02-15T19:00:00Z',
        sessionLength: 60,
        preferredMethod: 'video',
        totalSessions: 8,
        completedSessions: 3
      },
      progress: {
        goals: [
          {
            goal: 'Prepare for secondary school transition',
            progress: 65,
            status: 'on-track',
            milestones: ['School visits completed', 'Transition plan drafted']
          },
          {
            goal: 'Improve advocacy skills',
            progress: 40,
            status: 'in-progress',
            milestones: ['Attended workshop', 'Practice scenarios']
          }
        ],
        notes: 'Making excellent progress on transition planning. Very engaged and proactive.',
        satisfaction: 5
      }
    },

    availableMentors: [
      {
        id: 'mentor-234',
        name: 'Emma S.',
        title: 'Autism Parent & Support Coordinator',
        experience: '8+ years',
        specialties: ['Sensory Processing', 'Daily Living Skills', 'Sibling Support'],
        rating: 4.8,
        availability: 'Immediate',
        matchScore: 91,
        approach: 'Practical, empathetic support with focus on family wellbeing'
      },
      {
        id: 'mentor-345',
        name: 'James M.',
        title: 'SEN Teacher & Autism Dad',
        experience: '12+ years',
        specialties: ['School Support', 'Behavior Management', 'Communication'],
        rating: 4.7,
        availability: 'Limited slots',
        matchScore: 88,
        approach: 'Educational expertise combined with personal parenting experience'
      }
    ],

    mentorshipPrograms: [
      {
        id: 'program-1',
        name: 'New Parent Support',
        description: 'For parents newly navigating autism diagnosis and early support',
        duration: '3 months',
        sessions: 12,
        groupSize: 'Individual',
        cost: 'Free'
      },
      {
        id: 'program-2',
        name: 'Education Advocacy',
        description: 'Learn to effectively advocate for your child in educational settings',
        duration: '2 months',
        sessions: 8,
        groupSize: 'Small group (4-6)',
        cost: '£50'
      },
      {
        id: 'program-3',
        name: 'Transition Planning',
        description: 'Comprehensive support for major life transitions',
        duration: '4 months',
        sessions: 16,
        groupSize: 'Individual',
        cost: '£100'
      }
    ],

    applicationProcess: {
      steps: [
        'Complete detailed application form',
        'Brief video interview',
        'Background verification',
        'Mentor matching based on AI algorithm',
        'Initial meeting and goal setting'
      ],
      timeframe: '7-14 days',
      requirements: [
        'Verified community member',
        'Completed safety training',
        'Provided references',
        'Agreed to code of conduct'
      ]
    }
  };

  return NextResponse.json({
    success: true,
    data: mentorshipData
  });
}

async function getCommunityEvents(userId: string, filters: any) {
  const events = [
    {
      id: 'event-1',
      title: 'Sensory Play Workshop',
      description: 'Interactive workshop exploring sensory activities for children with autism. Led by qualified occupational therapist.',
      type: 'workshop',
      organizer: {
        name: 'Sensory Solutions Group',
        verified: true,
        rating: 4.8
      },
      datetime: '2024-02-17T10:00:00Z',
      duration: 120,
      location: {
        venue: 'North London Community Centre',
        address: '123 High Street, London N1 2AB',
        accessibility: ['Wheelchair accessible', 'Quiet space available', 'Sensory-friendly lighting'],
        parking: 'Free on-site parking',
        publicTransport: 'Angel Station (5 min walk)'
      },
      attendance: {
        current: 23,
        maximum: 30,
        waitlist: 5
      },
      pricing: {
        cost: 0,
        currency: 'GBP',
        includes: ['Materials', 'Refreshments', 'Take-home resources']
      },
      ageRecommendation: '2-12 years',
      tags: ['sensory', 'workshop', 'families', 'professional-led'],
      requirements: 'Booking essential',
      userStatus: 'interested',
      feedback: {
        rating: 4.9,
        reviews: 12,
        highlights: ['Very informative', 'Child-friendly', 'Practical tips']
      }
    },
    {
      id: 'event-2',
      title: 'Family Swimming Session',
      description: 'Autism-friendly swimming session with reduced capacity and sensory accommodations.',
      type: 'social',
      organizer: {
        name: 'Weekend Adventures',
        verified: true,
        rating: 4.6
      },
      datetime: '2024-02-18T14:00:00Z',
      duration: 90,
      location: {
        venue: 'Aqua Centre',
        address: '456 Pool Road, London SW2 3CD',
        accessibility: ['Changing rooms with privacy', 'Quiet areas', 'Sensory-friendly environment'],
        parking: 'Paid parking available',
        publicTransport: 'Brixton Station (10 min walk)'
      },
      attendance: {
        current: 12,
        maximum: 20,
        waitlist: 0
      },
      pricing: {
        cost: 5,
        currency: 'GBP',
        includes: ['Pool access', 'Changing facilities', 'Float equipment']
      },
      ageRecommendation: 'All ages',
      tags: ['swimming', 'sensory-friendly', 'exercise', 'social'],
      requirements: 'Swimming ability not required',
      userStatus: 'attending',
      feedback: {
        rating: 4.7,
        reviews: 8,
        highlights: ['Great for nervous swimmers', 'Supportive environment', 'Good value']
      }
    },
    {
      id: 'event-3',
      title: 'EHCP Workshop: Know Your Rights',
      description: 'Educational session on Education, Health and Care Plans - understanding the process, your rights, and how to prepare.',
      type: 'educational',
      organizer: {
        name: 'Autism Rights Collective',
        verified: true,
        rating: 4.9
      },
      datetime: '2024-02-22T19:00:00Z',
      duration: 90,
      location: {
        venue: 'Online via Zoom',
        address: 'Virtual event',
        accessibility: ['Closed captions', 'Recording available', 'Chat Q&A'],
        technicalRequirements: 'Stable internet connection'
      },
      attendance: {
        current: 78,
        maximum: 200,
        waitlist: 0
      },
      pricing: {
        cost: 0,
        currency: 'GBP',
        includes: ['Live session', 'Resource pack', 'Follow-up Q&A']
      },
      ageRecommendation: 'Parent/Carer event',
      tags: ['education', 'rights', 'ehcp', 'advocacy'],
      requirements: 'Registration required',
      userStatus: 'registered',
      feedback: {
        rating: 4.8,
        reviews: 24,
        highlights: ['Very informative', 'Expert speakers', 'Practical advice']
      }
    }
  ];

  // Apply filters
  let filteredEvents = events;

  if (filters.location) {
    filteredEvents = filteredEvents.filter(event =>
      event.location.venue.toLowerCase().includes(filters.location.toLowerCase()) ||
      event.location.address.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      events: filteredEvents,
      userEvents: {
        attending: filteredEvents.filter(e => e.userStatus === 'attending').length,
        interested: filteredEvents.filter(e => e.userStatus === 'interested').length,
        registered: filteredEvents.filter(e => e.userStatus === 'registered').length
      },
      recommendations: await generateEventRecommendations(userId, filteredEvents),
      filters: {
        types: ['workshop', 'social', 'educational', 'support-group', 'fundraising'],
        locations: ['North London', 'South London', 'Central London', 'Online'],
        ages: ['0-5 years', '6-11 years', '12-18 years', 'All ages', 'Parent/Carer']
      }
    }
  });
}

async function getCommunityDirectory(userId: string, filters: any) {
  const directory = {
    members: [
      {
        id: 'user-234',
        displayName: 'Sarah M.',
        location: 'North London',
        memberSince: '2023-08-15',
        childAges: ['7 years'],
        interests: ['Sensory Processing', 'School Support', 'Swimming'],
        supportOffered: ['Emotional Support', 'Experience Sharing', 'Activity Partner'],
        verificationLevel: 'Verified Parent',
        privacyLevel: 'Open to connections',
        lastActive: '1 hour ago',
        matchScore: 94,
        mutualConnections: 3,
        publicProfile: {
          bio: 'Mum to wonderful 7-year-old with autism. Love sharing sensory activities and school support tips.',
          achievements: ['Helped 12 families', 'Active contributor', 'Group moderator'],
          languages: ['English']
        }
      },
      {
        id: 'user-567',
        displayName: 'Emma T.',
        location: 'East London',
        memberSince: '2023-05-22',
        childAges: ['6 years', '9 years'],
        interests: ['Weekend Activities', 'Social Skills', 'Art Therapy'],
        supportOffered: ['Activity Organization', 'Sibling Support', 'Creative Ideas'],
        verificationLevel: 'Verified Parent',
        privacyLevel: 'Friends of friends',
        lastActive: '3 hours ago',
        matchScore: 87,
        mutualConnections: 5,
        publicProfile: {
          bio: 'Parent of two amazing children. Organizing autism-friendly activities across London.',
          achievements: ['Event organizer', 'Community builder', 'Mentor'],
          languages: ['English', 'Spanish']
        }
      }
    ],

    professionals: [
      {
        id: 'prof-123',
        name: 'Dr. Rachel K.',
        title: 'Educational Psychologist',
        specialties: ['Educational Assessment', 'Transition Planning', 'Advocacy Training'],
        experience: '15+ years',
        location: 'Central London',
        verificationLevel: 'Professional Verified',
        availability: 'Limited availability',
        rating: 4.9,
        reviewCount: 67,
        approaches: ['Evidence-based', 'Family-centered', 'Collaborative'],
        languages: ['English'],
        publicProfile: {
          bio: 'Specialized in autism education with personal parenting experience.',
          qualifications: ['PhD Educational Psychology', 'HCPC Registered'],
          communityRole: 'Volunteer mentor'
        }
      }
    ],

    mentors: [
      {
        id: 'mentor-234',
        name: 'James M.',
        experience: '8+ years parenting experience',
        specialties: ['School Transitions', 'Behavior Support', 'Dad Perspective'],
        availability: 'Weekly sessions',
        menteeCount: 3,
        successStories: 12,
        verificationLevel: 'Experienced Parent',
        matchScore: 85,
        languages: ['English'],
        publicProfile: {
          bio: 'Father supporting families through educational challenges and transitions.',
          approach: 'Practical, supportive guidance based on real experience'
        }
      }
    ],

    searchFilters: {
      location: ['North London', 'South London', 'East London', 'West London', 'Central London', 'Online'],
      childAge: ['0-2 years', '3-5 years', '6-11 years', '12-18 years', 'Adult'],
      interests: ['Sensory Processing', 'School Support', 'Social Skills', 'Activities', 'Therapy'],
      supportType: ['Emotional Support', 'Practical Help', 'Activity Partner', 'Experience Sharing'],
      availability: ['Immediate', 'This week', 'Flexible', 'Scheduled'],
      verificationLevel: ['Any', 'Verified Parents', 'Professionals Only']
    }
  };

  return NextResponse.json({
    success: true,
    data: directory
  });
}

// POST action handlers
async function createSupportGroup(userId: string, groupData: any) {
  const validatedData = createGroupSchema.parse(groupData);

  const newGroup = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    createdBy: userId,
    createdDate: new Date().toISOString(),
    members: [userId],
    moderators: [userId],
    status: 'active',
    verificationRequired: validatedData.requiresApproval || false
  };

  return NextResponse.json({
    success: true,
    data: newGroup,
    message: 'Support group created successfully'
  });
}

async function joinSupportGroup(userId: string, data: any) {
  const { groupId, message } = data;

  const joinRequest = {
    id: memoryDatabase.generateId(),
    userId,
    groupId,
    message,
    status: 'pending',
    requestDate: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    data: joinRequest,
    message: 'Join request submitted successfully'
  });
}

async function sendMessage(userId: string, messageData: any) {
  const validatedData = sendMessageSchema.parse(messageData);

  // Apply AI moderation
  const moderationResult = await moderateContent(validatedData.content, validatedData.messageType);

  if (!moderationResult.approved) {
    return NextResponse.json({
      success: false,
      error: 'Message content violates community guidelines',
      details: moderationResult.reason
    }, { status: 400 });
  }

  const message = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    senderId: userId,
    timestamp: new Date().toISOString(),
    isEncrypted: true,
    moderationScore: moderationResult.score,
    isDelivered: false,
    isRead: false
  };

  return NextResponse.json({
    success: true,
    data: message,
    message: 'Message sent successfully'
  });
}

async function requestMatchmaking(userId: string, matchData: any) {
  const validatedData = matchmakingRequestSchema.parse(matchData);

  // AI-powered matchmaking algorithm
  const matches = await findMatches(userId, validatedData);

  const matchRequest = {
    id: memoryDatabase.generateId(),
    userId,
    ...validatedData,
    requestDate: new Date().toISOString(),
    status: 'processing',
    matches: matches.slice(0, 5), // Top 5 matches
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  };

  return NextResponse.json({
    success: true,
    data: matchRequest,
    message: 'Matchmaking request processed successfully'
  });
}

async function applyMentorship(userId: string, mentorshipData: any) {
  const validatedData = mentorshipSchema.parse(mentorshipData);

  const application = {
    id: memoryDatabase.generateId(),
    userId,
    ...validatedData,
    applicationDate: new Date().toISOString(),
    status: 'under-review',
    reviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };

  return NextResponse.json({
    success: true,
    data: application,
    message: 'Mentorship application submitted successfully'
  });
}

async function createEvent(userId: string, eventData: any) {
  const validatedData = eventSchema.parse(eventData);

  const event = {
    id: memoryDatabase.generateId(),
    ...validatedData,
    organizerId: userId,
    createdDate: new Date().toISOString(),
    status: 'upcoming',
    attendees: [],
    waitlist: []
  };

  return NextResponse.json({
    success: true,
    data: event,
    message: 'Event created successfully'
  });
}

async function reportContent(userId: string, data: any) {
  const report = {
    id: memoryDatabase.generateId(),
    reporterId: userId,
    ...data,
    reportDate: new Date().toISOString(),
    status: 'under-review',
    priority: data.severity || 'medium'
  };

  return NextResponse.json({
    success: true,
    data: report,
    message: 'Content reported successfully. Our team will review within 24 hours.'
  });
}

async function updatePrivacySettings(userId: string, settings: any) {
  return NextResponse.json({
    success: true,
    data: { userId, ...settings, updatedAt: new Date().toISOString() },
    message: 'Privacy settings updated successfully'
  });
}

// AI helper functions
async function moderateContent(content: string, messageType: string) {
  // Simulate AI content moderation
  const sensitiveWords = ['address', 'phone', 'meet privately', 'personal info'];
  const hasSensitiveContent = sensitiveWords.some(word =>
    content.toLowerCase().includes(word)
  );

  return {
    approved: !hasSensitiveContent,
    score: hasSensitiveContent ? 0.3 : 0.9,
    reason: hasSensitiveContent ? 'Contains potentially sensitive information' : null,
    suggestions: hasSensitiveContent ? ['Use secure messaging for personal details'] : []
  };
}

async function findMatches(userId: string, preferences: any) {
  // Simulate AI-powered matchmaking
  return [
    {
      id: 'user-234',
      name: 'Sarah M.',
      matchScore: 94,
      commonInterests: ['Sensory Processing', 'School Support'],
      location: 'North London',
      distance: '2.3 miles',
      verificationStatus: 'Verified',
      compatibility: {
        interests: 0.95,
        location: 0.89,
        childAge: 0.92,
        communication: 0.96
      }
    }
  ];
}

async function generateGroupRecommendations(userId: string, groups: any[]) {
  return [
    {
      reason: 'Based on your interests in sensory processing',
      groups: groups.filter(g => g.tags.includes('sensory')).slice(0, 2)
    },
    {
      reason: 'Popular in your area',
      groups: groups.filter(g => g.location.includes('London')).slice(0, 2)
    }
  ];
}

async function generateEventRecommendations(userId: string, events: any[]) {
  return events.slice(0, 3).map(event => ({
    ...event,
    recommendationReason: 'Matches your interests and location preferences'
  }));
}
