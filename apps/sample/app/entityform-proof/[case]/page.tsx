import { EntityFormProofClient } from '../EntityFormProofClient';

export default async function EntityFormProofCasePage({
  params,
}: {
  params: Promise<{ case: string }>;
}) {
  const { case: caseId } = await params;
  return <EntityFormProofClient caseId={caseId} />;
}
