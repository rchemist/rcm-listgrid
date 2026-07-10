import { createRcmAdapter } from '@listgrid/backend-rcm';

// The RCM backend adapter for the sample. url like '/college' → the routes at
// /api/college/search etc. (baseUrl '/api'). Same-origin; the browser's fetch
// is used.
export const rcmAdapter = createRcmAdapter({ baseUrl: '/api' });
