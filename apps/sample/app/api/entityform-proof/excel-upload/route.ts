import { NextRequest, NextResponse } from 'next/server';
import { entityFormProofStore } from '../../../../lib/mock-backend/entityform-proof';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (
    !Array.isArray(body.rows) ||
    body.rows.some((row) => typeof row !== 'object' || row === null)
  ) {
    return NextResponse.json({ message: 'body.rows must be an array of objects' }, { status: 400 });
  }
  const rows = entityFormProofStore().upsertMany(body.rows as Record<string, unknown>[]);
  return NextResponse.json({ rows, count: rows.length });
}
