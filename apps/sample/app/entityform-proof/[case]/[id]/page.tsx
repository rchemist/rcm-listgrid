import { EntityFormProofClient } from '../../EntityFormProofClient';

export default async function EntityFormProofEditPage({
  params,
}: {
  params: Promise<{ case: string; id: string }>;
}) {
  const { case: caseId, id } = await params;
  return <EntityFormProofClient caseId={caseId} id={id} />;
}
