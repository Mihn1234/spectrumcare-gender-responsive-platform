// Minimal Prisma client configuration for build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createModel = () => ({
  findMany: async (args?: unknown) => [],
  findUnique: async (args?: unknown) => ({
    id: 'mock-id',
    dateOfBirth: new Date('1990-01-01'),
    diagnosis: 'Mock diagnosis',
    healthRecords: [],
    assessments: [],
    // Add other common properties that might be accessed
  }),
  create: async (args?: unknown) => ({ id: 'mock-id' }),
  update: async (args?: unknown) => ({ id: 'mock-id' }),
  delete: async (args?: unknown) => ({ id: 'mock-id' }),
  findFirst: async (args?: unknown) => ({ id: 'mock-id' }),
  upsert: async (args?: unknown) => ({ id: 'mock-id' }),
  count: async (args?: unknown) => 0,
});

export const prisma = {
  user: createModel(),
  document: createModel(),
  child: createModel(),
  parent: createModel(),
  assessment: createModel(),
  appointment: createModel(),
  professional: createModel(),
  notification: createModel(),
  conversation: createModel(),
  message: createModel(),
  activity: createModel(),
  case: createModel(),
  team: createModel(),
  tenant: createModel(),
  ehcPlan: createModel(),
  ehcPlanSection: createModel(),
  ehcPlanOutcome: createModel(),
  ehcPlanProvision: createModel(),
  voiceInteraction: createModel(),
  whatsappInteraction: createModel(),
  patient: createModel(),
  healthRecord: createModel(),
  aiAnalysis: createModel(),
  // Add any other models as needed
};

export default prisma;
