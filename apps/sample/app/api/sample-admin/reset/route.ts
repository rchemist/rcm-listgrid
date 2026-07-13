import { NextRequest, NextResponse } from 'next/server';
import {
  entityFormProofSeed,
  entityFormProofStore,
} from '../../../../lib/mock-backend/entityform-proof';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resets = {
  'entityform-proof': () => entityFormProofStore().reset(entityFormProofSeed),
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (!Array.isArray(body.entities) || body.entities.some((name) => !(name in resets))) {
    return NextResponse.json(
      { message: 'entities contains a non-allow-listed sample' },
      { status: 400 },
    );
  }
  const result: Record<string, unknown> = {};
  for (const name of body.entities as (keyof typeof resets)[]) result[name] = resets[name]();
  return NextResponse.json({ reset: Object.keys(result), rows: result });
}
