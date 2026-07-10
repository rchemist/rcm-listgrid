// Host-injected auth contract (charter C7 — "엔진은 아무것도 소유하지 않는다").
//
// schema-core owns only the MINIMAL shape its predicates read: `roles` (either
// directly on the session or under `authentication.roles`). Host apps pass
// richer Session objects; the index signature keeps them structurally
// assignable. Transplanted from src/listgrid/auth/types.ts (0.3.x) — unchanged
// shape, new home. Permission extraction lives in ./permission.

export interface SessionUser {
  id?: string | number;
  name?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface Session {
  roles?: string[];
  authentication?: {
    roles?: string[];
    [key: string]: unknown;
  };
  getUser?: () => SessionUser | null | undefined;
  [key: string]: unknown;
}
