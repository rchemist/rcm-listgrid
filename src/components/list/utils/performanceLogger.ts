/**
 * ListGrid Performance Logger
 *
 * Enable/disable via environment variable:
 * NEXT_PUBLIC_DEBUG_LISTGRID_PERFORMANCE=true (or false)
 *
 * To remove all performance logging:
 * 1. Delete this file
 * 2. Remove imports and usage from ViewListGrid.tsx and useListGridLogic.ts
 */

const isEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  // 환경변수가 'false'로 명시된 경우에만 비활성화, 그 외에는 개발 환경에서 활성화
  if (process.env.NEXT_PUBLIC_DEBUG_LISTGRID_PERFORMANCE === 'false') return false;
  if (process.env.NEXT_PUBLIC_DEBUG_LISTGRID_PERFORMANCE === 'true') return true;
  // 기본값: 개발 환경에서는 활성화
  return process.env.NODE_ENV === 'development';
};

const PREFIX = '[ListGrid Performance]';

export const perfLog = {
  // ==================== Component Lifecycle ====================

  mounted: (duration: number, context: { entityUrl?: string; isSubCollection?: boolean }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [Component] Mounted in ${duration.toFixed(2)}ms`, context);
  },

  unmounted: (context: { entityUrl?: string }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [Component] Unmounted`, context);
  },

  rowsRendered: (context: { entityUrl?: string; rowCount: number; totalCount?: number; timeSinceMount: string }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [Component] Rows rendered`, context);
  },

  // ==================== Data Loading (React State) ====================

  loadingStarted: (context: { entityUrl?: string }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [State] Loading started`, context);
  },

  loadingCompleted: (duration: number, context: { entityUrl?: string; rowCount: number; totalCount?: number }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [State] Loading completed in ${duration.toFixed(2)}ms`, context);
  },

  // ==================== API Call (Network) ====================

  apiStarted: (context: { entityUrl?: string; page?: number; pageSize?: number }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [API] Request started`, context);
  },

  apiCompleted: (duration: number, context: { entityUrl?: string; rowCount: number; totalCount?: number; page?: number }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [API] Response received in ${duration.toFixed(2)}ms`, context);
  },

  apiError: (duration: number, context: { entityUrl?: string; errors: string[] }) => {
    if (!isEnabled()) return;
    console.log(`${PREFIX} [API] Error after ${duration.toFixed(2)}ms`, context);
  },
};
