// Stage 3 — Host-supplied domain field extension registry.
//
// The original library hard-wired `SmsHistoryField` (an academic-system
// domain artifact from a separate entities module) directly in EntityForm.tsx. A truly
// reusable library cannot assume SMS history exists; instead host apps
// register their own SMS-history-like field implementation here.
//
// If no host implementation is registered, the SMS history behaviour is
// silently skipped — callers should check `createSmsHistoryField` for null.

export interface SmsHistoryFieldConstructor {
  new (fieldName: string, order: number, targetFieldName: string): any;
}

let _smsHistoryFieldCtor: SmsHistoryFieldConstructor | undefined;

export function registerSmsHistoryField(ctor: SmsHistoryFieldConstructor): void {
  _smsHistoryFieldCtor = ctor;
}

export function createSmsHistoryField(
  fieldName: string,
  order: number,
  targetFieldName: string,
): any | null {
  if (!_smsHistoryFieldCtor) {
    console.warn(
      '[@rchemist/listgrid] SMS history field requested but no implementation registered. ' +
        'Call registerSmsHistoryField(YourSmsHistoryFieldClass) at bootstrap.',
    );
    return null;
  }
  return new _smsHistoryFieldCtor(fieldName, order, targetFieldName);
}
