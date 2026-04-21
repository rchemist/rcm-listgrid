[**@rchemist/listgrid API Reference**](../../README.md)

***

[@rchemist/listgrid API Reference](../../README.md) / [listgrid](../README.md) / GlobalModalManager

# Function: GlobalModalManager()

> **GlobalModalManager**(): `Element` \| `null`

Defined in: [listgrid/ui/GlobalModalManager.tsx:28](https://github.com/rchemist/rcm-listgrid/blob/b27ec79868acd9c1ed21321f6571558c5fffa2f8/src/listgrid/ui/GlobalModalManager.tsx#L28)

GlobalModalManager — renders the library's modal stack.

Library field components (e.g. `<ManyToOneField>`) call
`useModalManagerStore().openModal(...)` to push a modal onto the stack.
Without this renderer mounted in the tree, nothing displays — the store
updates but no component subscribes.

Mount once in your app layout, ABOVE the pages that use listgrid forms:

  import { GlobalModalManager } from '@rchemist/listgrid';

  <UIProvider components={...}>
    <GlobalModalManager />
    {children}
  </UIProvider>

Host apps that already ship their own modal manager wired to a separate
store (e.g. `the legacy UI kit`) still need THIS component
— the two stores are independent zustand instances and do not share state.

## Returns

`Element` \| `null`
