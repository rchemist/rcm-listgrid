// Stage 3a placeholder for host-supplied signOut().
// Non-component code (e.g. PageResult.fetchListData) cannot read React context,
// so sign-out needs a module-scope registry. Full integration lands in Stage 5
// (ApiClientProvider / host services registry).

type SignOutFn = () => Promise<void> | void;

let _signOut: SignOutFn | undefined;

export function registerSignOut(fn: SignOutFn): void {
  _signOut = fn;
}

export async function signOut(): Promise<void> {
  if (_signOut) {
    await _signOut();
    return;
  }
  console.warn(
    '[@rchemist/listgrid] signOut() called but no host implementation is registered. ' +
      'Call registerSignOut(yourImpl) at app bootstrap.',
  );
}
