import { createContext, useContext, type ReactNode } from 'react';
import type { UIComponents } from '@listgrid/ui-default';

// UIProvider — the seam through which the renderer picks up its input
// primitives (charter C7: "엔진은 아무것도 소유하지 않는다" — @listgrid/react owns
// zero concrete widgets; every registered field renderer resolves its
// TextInput/SelectBox/etc. through this context). A host can spread
// `defaultUIComponents` (from @listgrid/ui-default) unmodified, override
// piecemeal, or swap the whole registry for a design-system-native set.

const UIContext = createContext<UIComponents | undefined>(undefined);

export interface UIProviderProps {
  components: UIComponents;
  children?: ReactNode;
}

export function UIProvider({ components, children }: UIProviderProps) {
  return <UIContext.Provider value={components}>{children}</UIContext.Provider>;
}

/**
 * Returns the injected {@link UIComponents} registry. Throws a clear error if
 * called outside a `<UIProvider>` ancestor (charter C7 — a renderer with no
 * injected primitives is a host wiring bug, not a valid runtime state).
 */
export function useUI(): UIComponents {
  const ctx = useContext(UIContext);
  if (ctx === undefined) {
    throw new Error(
      '[@listgrid/react] useUI() was called without a <UIProvider> ancestor. ' +
        'Wrap your app in <UIProvider components={defaultUIComponents}> (or a host-supplied ' +
        'UIComponents registry) before rendering any listgrid form/list.',
    );
  }
  return ctx;
}
