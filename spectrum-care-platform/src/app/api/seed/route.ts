import { NextRequest, NextResponse } from 'next/server';
import { memoryDatabase } from '@/lib/memory-database';

// ... existing code ... <imports>

export async function GET() {
  try {
    const stats = await memoryDatabase.getStats();

    // ... existing code ... <rest of GET function>
  } catch (error) {
    // ... existing code ... <error handling>
  }
}

export async function POST() {
  try {
    // ... existing code ... <seeding logic>

    const stats = await memoryDatabase.getStats();

    // ... existing code ... <rest of POST function>
  } catch (error) {
    // ... existing code ... <error handling>
  }
}
