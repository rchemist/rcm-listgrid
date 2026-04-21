// Auth contract consumed by @rchemist/listgrid.
//
// Host applications provide a concrete Session implementation via <AuthProvider>.
// The shape mirrors the original listgrid usage: roles can live directly on
// the session or under `authentication.roles`, and `getUser()` is expected
// to be present (host apps with plain session objects should wrap their data
// before passing to AuthProvider).
//
// The [key: string]: unknown index signature lets host apps pass richer Session
// objects without type errors. ListGrid itself only reads the fields declared
// explicitly below.

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
  // getUser is optional so host apps that pass plain session objects (without
  // a `getUser()` accessor) remain structurally assignable. Runtime code in
  // the library always guards the call with `typeof session.getUser === 'function'`.
  getUser?: () => SessionUser | null | undefined;
  [key: string]: unknown;
}
