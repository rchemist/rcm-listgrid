// Stage 3a stub — RequestUtil placeholder.
// The host-provided API client contract lands in Stage 5 (ApiClientProvider);
// for now this exports an `any` escape hatch so existing call sites compile.

const __stub: any = new Proxy({}, { get: () => __stub });
export default __stub;
export const RequestUtil: any = __stub;
export const callExternalHttpRequest: any = (..._args: any[]) => {
    throw new Error(
        '[@rcm/listgrid] callExternalHttpRequest is not implemented. ' +
            'Stage 5 ApiClientProvider will supply this.'
    );
};
