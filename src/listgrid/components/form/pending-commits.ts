'use client';

interface CommitRegistry {
  chain: Promise<void>;
  pending: number;
}

const registries = new Map<string, CommitRegistry>();
const DEFAULT_FORM_ID = '__default__';

function getRegistry(formId?: string): CommitRegistry {
  const key = formId ?? DEFAULT_FORM_ID;
  let registry = registries.get(key);

  if (!registry) {
    registry = {
      chain: Promise.resolve(),
      pending: 0,
    };
    registries.set(key, registry);
  }

  return registry;
}

export function enqueueCommit<T>(formId: string | undefined, run: () => Promise<T>): Promise<T> {
  const registry = getRegistry(formId);
  registry.pending += 1;

  const commit = registry.chain.then(run).finally(() => {
    registry.pending -= 1;
  });

  registry.chain = commit.then(
    () => undefined,
    () => undefined,
  );

  return commit;
}

export async function flushCommits(formId?: string): Promise<void> {
  const registry = getRegistry(formId);

  while (registry.pending > 0) {
    await registry.chain;
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
}
