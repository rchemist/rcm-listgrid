// configureMessages — module-scope UI-feedback registry (0.3.x
// message/MessageProvider successor). Renderers call `getMessages().showToast`
// / `showConfirm` / `showError` instead of depending on a concrete toast/modal
// library directly (charter C7). A host that never calls configureMessages()
// still gets a safe, observable fallback (console), so an unwired app degrades
// gracefully instead of throwing mid-interaction.

export type ToastKind = 'success' | 'error' | 'info';

export interface MessagesRegistry {
  showConfirm: (message: string) => Promise<boolean>;
  showToast: (message: string, kind?: ToastKind) => void;
  showError: (message: string) => void;
}

const consoleFallback: MessagesRegistry = {
  async showConfirm(message) {
    console.warn(
      '[@listgrid/react] showConfirm() called but no MessagesRegistry is configured ' +
        '(call configureMessages({ showConfirm })). Defaulting to false. message:',
      message,
    );
    return false;
  },
  showToast(message, kind) {
    console.warn(
      `[@listgrid/react] showToast(${kind ?? 'info'}) called but no MessagesRegistry is ` +
        'configured (call configureMessages({ showToast })). message:',
      message,
    );
  },
  showError(message) {
    console.error(
      '[@listgrid/react] showError() called but no MessagesRegistry is configured ' +
        '(call configureMessages({ showError })). message:',
      message,
    );
  },
};

let registry: MessagesRegistry = { ...consoleFallback };

/** Install (partially or fully) the host's message handlers. Merges with the current registry. */
export function configureMessages(config: Partial<MessagesRegistry>): void {
  registry = { ...registry, ...config };
}

/** The active registry — call sites use `getMessages().showToast(...)` etc. */
export function getMessages(): MessagesRegistry {
  return registry;
}

/** Test/host escape hatch — restore the console-fallback registry. */
export function resetMessages(): void {
  registry = { ...consoleFallback };
}
