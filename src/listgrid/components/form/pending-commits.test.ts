import { describe, expect, it } from 'vitest';
import { enqueueCommit, flushCommits } from './pending-commits';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('pending commits', () => {
  it('serializes commits for the same form in enqueue order', async () => {
    const firstGate = deferred();
    const order: string[] = [];

    const first = enqueueCommit('serialization-form', async () => {
      order.push('first:start');
      await firstGate.promise;
      order.push('first:end');
    });
    const second = enqueueCommit('serialization-form', async () => {
      order.push('second:start');
      order.push('second:end');
    });

    await Promise.resolve();
    expect(order).toEqual(['first:start']);

    firstGate.resolve();
    await Promise.all([first, second]);

    expect(order).toEqual(['first:start', 'first:end', 'second:start', 'second:end']);
  });

  it('flush waits for every commit chained for the form', async () => {
    const commitGate = deferred();
    const nestedCommitGate = deferred();
    let flushed = false;

    void enqueueCommit('flush-form', async () => {
      await commitGate.promise;
      void enqueueCommit('flush-form', async () => {
        await nestedCommitGate.promise;
      });
    });

    const flush = flushCommits('flush-form').then(() => {
      flushed = true;
    });

    await Promise.resolve();
    expect(flushed).toBe(false);

    commitGate.resolve();
    await Promise.resolve();
    expect(flushed).toBe(false);

    nestedCommitGate.resolve();
    await flush;
    expect(flushed).toBe(true);
  });

  it('does not make one form wait for another form commits', async () => {
    const blockedGate = deferred();
    let isolatedCommitFinished = false;

    const blockedCommit = enqueueCommit('blocked-form', async () => {
      await blockedGate.promise;
    });
    const isolatedCommit = enqueueCommit('isolated-form', async () => {
      isolatedCommitFinished = true;
    });

    await flushCommits('isolated-form');
    await isolatedCommit;
    expect(isolatedCommitFinished).toBe(true);

    blockedGate.resolve();
    await blockedCommit;
  });
});
