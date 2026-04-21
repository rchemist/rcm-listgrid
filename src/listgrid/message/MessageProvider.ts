// Stage 3c — host-supplied messaging services.
//
// Called from both React components AND static class methods (e.g. PageResult.fetchListData),
// so we use a module-scope registry rather than React Context. Host apps invoke
// `configureMessages({ ... })` at app bootstrap to inject concrete implementations.

import type React from 'react';

// intentional: host apps pass opaque options for their UI libraries
export interface MessageServices {
  showAlert(options: unknown): Promise<unknown>;
  showConfirm(options: unknown): Promise<boolean>;
  showSuccess(options: unknown): Promise<unknown> | unknown;
  showToast(options: unknown): unknown;
  showError(message: unknown): unknown;
  openToast(options: unknown): unknown;
  clearAllToasts(): unknown;
}

// Default no-op implementations with console warnings.
const DEFAULT: MessageServices = {
  showAlert: (o) => {
    console.warn('[@rchemist/listgrid] showAlert called without configured implementation.', o);
    return Promise.resolve();
  },
  showConfirm: (o) => {
    console.warn('[@rchemist/listgrid] showConfirm called without configured implementation.', o);
    return Promise.resolve(false);
  },
  showSuccess: (o) => {
    console.warn('[@rchemist/listgrid] showSuccess called without configured implementation.', o);
  },
  showToast: (o) => {
    console.warn('[@rchemist/listgrid] showToast called without configured implementation.', o);
  },
  showError: (m) => {
    console.warn('[@rchemist/listgrid] showError called without configured implementation.', m);
  },
  openToast: (o) => {
    console.warn('[@rchemist/listgrid] openToast called without configured implementation.', o);
  },
  clearAllToasts: () => {
    /* noop */
  },
};

let _services: MessageServices = { ...DEFAULT };

export function configureMessages(services: Partial<MessageServices>): void {
  _services = { ...DEFAULT, ..._services, ...services };
}

// Thin wrapper functions matching the original the legacy UI kit API.
export function showAlert(options: unknown): Promise<unknown> {
  return _services.showAlert(options);
}
export function showConfirm(options: unknown): Promise<boolean> {
  return _services.showConfirm(options);
}
export function showSuccess(options: unknown): unknown {
  return _services.showSuccess(options);
}
export function showToast(options: unknown): unknown {
  return _services.showToast(options);
}
export function showError(message: unknown): unknown {
  return _services.showError(message);
}
export function openToast(options: unknown): unknown {
  return _services.openToast(options);
}
export function clearAllToasts(): unknown {
  return _services.clearAllToasts();
}

// The original exported `ShowError` (PascalCase) as well — likely a React component.
// Stub it as a no-op renderless component for now; host apps that need a
// visual error display can override via showError or component props.
// intentional: host apps pass arbitrary props to the renderless stub
export const ShowError: React.FC<Record<string, unknown>> = () => null;
