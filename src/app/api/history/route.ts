import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db/client';
import { gameSessions } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch game sessions for the user with nested relations
    const sessions = await db.query.gameSessions.findMany({
      where: eq(gameSessions.userId, userId),
      orderBy: [desc(gameSessions.createdAt)],
      limit,
      offset,
      with: {
        differences: true,
        userAnswers: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game history' },
      { status: 500 }
    );
  }
}
