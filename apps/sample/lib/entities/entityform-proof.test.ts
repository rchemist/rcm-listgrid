import { describe, expect, it } from 'vitest';
import { EntityFormIdentityDiagnostics, EntityFormProofCase } from './entityform-proof';
import { entityFormProofManifest } from './entityform-proof-manifest';

describe('EntityForm proof manifest closure', () => {
  it('constructs every implemented manifest sampleCase through the shared factory', () => {
    const branches = entityFormProofManifest.members.flatMap((entry) => entry.branches);
    const proofs = [...branches, ...entityFormProofManifest.integrations];
    expect(proofs.every((proof) => proof.status === 'implemented')).toBe(true);

    const sampleCases = [...new Set(proofs.map((proof) => proof.sampleCase))];
    expect(sampleCases.length).toBeGreaterThan(0);
    for (const sampleCase of sampleCases) {
      const form = EntityFormProofCase(sampleCase, 'proof-id');
      expect(form.name).toBe('EntityFormProof');
      expect(form.url).toBe('/entityform-proof');
      expect(form.getFields().length).toBeGreaterThan(0);
      form.getDataTransfer();
      form.getCapabilities();
      form.getActions();
      form.getTabs();
      form.getFieldGroups();
      form.getSteps();
      form.clone();
    }
  });

  it('keeps the clone/meta/query diagnostics executable outside the browser', () => {
    const diagnostics = EntityFormIdentityDiagnostics();
    expect(diagnostics).toMatchObject({
      isolation: { nestedShared: true, hookArraysDistinct: true },
      subclassPreserved: true,
    });
  });
});
