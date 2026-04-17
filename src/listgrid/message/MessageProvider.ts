// Stage 3c — host-supplied messaging services.
//
// Called from both React components AND static class methods (e.g. PageResult.fetchListData),
// so we use a module-scope registry rather than React Context. Host apps invoke
// `configureMessages({ ... })` at app bootstrap to inject concrete implementations.

export interface MessageServices {
    showAlert(options: any): Promise<any>;
    showConfirm(options: any): Promise<boolean>;
    showSuccess(options: any): Promise<any> | any;
    showToast(options: any): any;
    showError(message: any): any;
    openToast(options: any): any;
    clearAllToasts(): any;
}

// Default no-op implementations with console warnings.
const DEFAULT: MessageServices = {
    showAlert: (o) => {
        console.warn('[@rcm/listgrid] showAlert called without configured implementation.', o);
        return Promise.resolve();
    },
    showConfirm: (o) => {
        console.warn('[@rcm/listgrid] showConfirm called without configured implementation.', o);
        return Promise.resolve(false);
    },
    showSuccess: (o) => {
        console.warn('[@rcm/listgrid] showSuccess called without configured implementation.', o);
    },
    showToast: (o) => {
        console.warn('[@rcm/listgrid] showToast called without configured implementation.', o);
    },
    showError: (m) => {
        console.warn('[@rcm/listgrid] showError called without configured implementation.', m);
    },
    openToast: (o) => {
        console.warn('[@rcm/listgrid] openToast called without configured implementation.', o);
    },
    clearAllToasts: () => {
        /* noop */
    },
};

let _services: MessageServices = { ...DEFAULT };

export function configureMessages(services: Partial<MessageServices>): void {
    _services = { ...DEFAULT, ..._services, ...services };
}

// Thin wrapper functions matching the original @gjcu/ui/message/messageUtils API.
export function showAlert(options: any): Promise<any> {
    return _services.showAlert(options);
}
export function showConfirm(options: any): Promise<boolean> {
    return _services.showConfirm(options);
}
export function showSuccess(options: any): any {
    return _services.showSuccess(options);
}
export function showToast(options: any): any {
    return _services.showToast(options);
}
export function showError(message: any): any {
    return _services.showError(message);
}
export function openToast(options: any): any {
    return _services.openToast(options);
}
export function clearAllToasts(): any {
    return _services.clearAllToasts();
}

// The original exported `ShowError` (PascalCase) as well — likely a React component.
// Stub it as a no-op renderless component for now; host apps that need a
// visual error display can override via showError or component props.
export const ShowError: any = () => null;
