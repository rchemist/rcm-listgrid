[**@rcm/listgrid API Reference**](../../README.md)

***

[@rcm/listgrid API Reference](../../README.md) / [listgrid](../README.md) / GlobalModalManager

# Function: GlobalModalManager()

> **GlobalModalManager**(): `Element` \| `null`

Defined in: [listgrid/ui/GlobalModalManager.tsx:35](https://github.com/rchemist/rcm-listgrid/blob/2083fe08ca61f7122b1b79503d82286ad7b6b04e/src/listgrid/ui/GlobalModalManager.tsx#L35)

GlobalModalManager — renders the library's modal stack.

Library field components (e.g. `<ManyToOneField>`) call
`useModalManagerStore().openModal(...)` to push a modal onto the stack.
Without this renderer mounted in the tree, nothing displays — the store
updates but no component subscribes.

Mount once in your app layout, ABOVE the pages that use listgrid forms:

  import { GlobalModalManager } from '@rcm/listgrid';

  <UIProvider components={...}>
    <GlobalModalManager />
    {children}
  </UIProvider>

Host apps that already ship their own modal manager wired to a separate
store (e.g. `@gjcu/ui/modals/GlobalModalManager`) still need THIS component
— the two stores are independent zustand instances and do not share state.

## Returns

`Element` \| `null`
