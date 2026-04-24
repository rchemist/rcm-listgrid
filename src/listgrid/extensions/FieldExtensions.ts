// Host-supplied domain field extension registry.
//
// `@rchemist/listgrid` does not ship a built-in `SmsHistoryField` implementation
// because the field depends on a host application's SMS history schema.
// Host apps register their own implementation via `registerSmsHistoryField`
// (and optionally opt into the auto-injection behaviour via
// `registerPhoneNumberSmsHistoryInject`).
//
// If no host implementation is registered, the SMS history behaviour is
// silently skipped — callers check `createSmsHistoryField` for null.

import type { Session } from '../auth/types';

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

/**
 * Auto-injection configuration for the SMS history tab.
 *
 * When a `PhoneNumberField` with `enableSms=true` is processed during EntityForm
 * initialization and this injector is registered with `enabled: true`, the
 * library adds a "SMS 발송 이력" tab containing an `SmsHistoryField` (obtained
 * via `createSmsHistoryField`) next to the phone number field.
 *
 * The `permission` predicate gates the injection per user session. If unset,
 * the tab is injected for every session (library default: permissive).
 *
 * Default: disabled (opt-in). Hosts must explicitly call
 * `registerPhoneNumberSmsHistoryInject({ enabled: true, ... })` at bootstrap.
 */
export interface PhoneNumberSmsHistoryInjectConfig {
  enabled: boolean;
  permission?: (session?: Session) => boolean;
  tabLabel?: string;
  tabId?: string;
  /** Offset applied to STATUS_TAB_INFO.order to position the tab. Default: -10. */
  tabOrderOffset?: number;
}

let _smsHistoryInjectConfig: Required<PhoneNumberSmsHistoryInjectConfig> = {
  enabled: false,
  permission: () => true,
  tabLabel: 'SMS 발송 이력',
  tabId: 'smsHistory',
  tabOrderOffset: -10,
};

export function registerPhoneNumberSmsHistoryInject(
  config: PhoneNumberSmsHistoryInjectConfig,
): void {
  _smsHistoryInjectConfig = {
    enabled: config.enabled,
    permission: config.permission ?? (() => true),
    tabLabel: config.tabLabel ?? 'SMS 발송 이력',
    tabId: config.tabId ?? 'smsHistory',
    tabOrderOffset: config.tabOrderOffset ?? -10,
  };
}

export function getPhoneNumberSmsHistoryInjectConfig(): Required<PhoneNumberSmsHistoryInjectConfig> {
  return _smsHistoryInjectConfig;
}
