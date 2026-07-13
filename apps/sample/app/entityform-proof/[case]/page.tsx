import { EntityFormProofClient } from '../EntityFormProofClient';
import { EntityFormProofList } from '../EntityFormProofList';

export default async function EntityFormProofCasePage({
  params,
}: {
  params: Promise<{ case: string }>;
}) {
  const { case: caseId } = await params;
  if (caseId.startsWith('on-before-list-fetch--') || caseId.startsWith('on-after-list-fetch--')) {
    return <EntityFormProofList caseId={caseId} />;
  }
  return <EntityFormProofClient caseId={caseId} />;
}
