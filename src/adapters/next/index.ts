// Public entry for the Next.js adapter.
//
// Consumers:
//   import { nextRouterServices, nextUrlStateServices } from '@rchemist/listgrid/next';
//   <RouterProvider value={nextRouterServices}>
//     <UrlStateProvider value={nextUrlStateServices}>
//       <YourApp />
//     </UrlStateProvider>
//   </RouterProvider>

export { nextRouterServices } from './NextRouterAdapter';
export { nextUrlStateServices } from './NextUrlStateAdapter';
export { NextListGridProvider } from './NextListGridProvider';
export type { NextListGridProviderProps } from './NextListGridProvider';
