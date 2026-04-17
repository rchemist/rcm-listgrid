// Stage 5 — Backend contract types.
//
// The RCM-framework backend returns a consistent response shape across
// CRUD endpoints. `ResponseData` wraps the payload + metadata and
// exposes `isError()` as a convenience for call sites that predate the
// optional `error` / `entityError` fields.
//
// Host applications inject a concrete ApiClient (see ApiClient.ts) that
// produces ResponseData instances from HTTP calls; listgrid code consumes
// the shape but never constructs a real HTTP layer.

export interface IEntityError {
    error: IEntityErrorBody;
    [key: string]: any;
}

export interface IEntityErrorBody {
    error?: boolean | string;
    message?: string;
    fieldError?: Map<string, string[]> | Record<string, string[]>;
    [key: string]: any;
}

// ResponseData is a class so call sites can `new ResponseData()` to construct
// synthetic responses (e.g. client-side 500s when session is missing).
// The original @gjcu/ui ResponseData was also a class; instance methods like
// `isError()` are preserved.
export class ResponseData<T = any> {
    data: T = null as any;
    status?: number;
    error?: string;
    entityError?: IEntityError;

    constructor(init?: Partial<ResponseData<T>>) {
        if (init) Object.assign(this, init);
    }

    isError(): boolean {
        return !!(this.error || this.entityError || (this.status && this.status >= 400));
    }
}

export function createResponseData<T = any>(init: Partial<ResponseData<T>> & { data?: T }): ResponseData<T> {
    return new ResponseData<T>(init as any);
}
