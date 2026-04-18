// Thin compatibility shim pointing ExcelProvider at the host-configured ApiClient.
// See src/listgrid/api/ApiClient.ts.

import { callExternalHttpRequest as _call } from '../api';
export const callExternalHttpRequest = _call;
export const RequestUtil = { callExternalHttpRequest: _call };
export default RequestUtil;
