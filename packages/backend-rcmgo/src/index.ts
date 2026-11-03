// @listgrid/backend-rcmgo — BackendAdapter impl for Go (rcm-go) backends (CB-05).
//
// Cursor-paginated GET list endpoints (`cursor` + `page_size`/`limit`, rows
// under a data key, next cursor at `page.next_cursor` or top-level
// `next_cursor`) behind the schema-core BackendAdapter contract.
export { createRcmgoAdapter, defaultRcmgoParams } from './adapter';
export type { RcmgoAdapterOptions, RcmgoParams } from './adapter';
