import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  configureMessages,
  showAlert,
  showConfirm,
  showSuccess,
  showToast,
  showError,
  openToast,
  clearAllToasts,
  ShowError,
  type MessageServices,
} from './MessageProvider';

/**
 * MessageProvider is a module-scope registry (not a React Context), so we can
 * exercise it directly. Each test installs a stub via configureMessages, then
 * asserts the top-level wrappers delegate to it.
 *
 * Tests do NOT cover the ShowError React stub beyond ensuring it is defined as
 * a renderless component per the existing implementation.
 */

// Silence the default-implementation console.warn calls, which would otherwise
// clutter the test output when a stubbed method calls back into the defaults.
let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('configureMessages', () => {
  it('installs a showAlert implementation that is invoked by showAlert()', async () => {
    const impl = vi.fn().mockResolvedValue('ok');
    configureMessages({ showAlert: impl });
    const result = await showAlert({ title: 'hi' });
    expect(impl).toHaveBeenCalledWith({ title: 'hi' });
    expect(result).toBe('ok');
  });

  it('installs a showConfirm implementation', async () => {
    const impl = vi.fn().mockResolvedValue(true);
    configureMessages({ showConfirm: impl });
    const result = await showConfirm({ message: 'ok?' });
    expect(impl).toHaveBeenCalledWith({ message: 'ok?' });
    expect(result).toBe(true);
  });

  it('installs a showSuccess implementation', () => {
    const impl = vi.fn().mockReturnValue('sent');
    configureMessages({ showSuccess: impl });
    expect(showSuccess({ message: 'done' })).toBe('sent');
    expect(impl).toHaveBeenCalledWith({ message: 'done' });
  });

  it('installs a showToast implementation', () => {
    const impl = vi.fn().mockReturnValue('toast-id');
    configureMessages({ showToast: impl });
    expect(showToast({ text: 'hi' })).toBe('toast-id');
  });

  it('installs a showError implementation', () => {
    const impl = vi.fn().mockReturnValue('shown');
    configureMessages({ showError: impl });
    expect(showError('boom')).toBe('shown');
    expect(impl).toHaveBeenCalledWith('boom');
  });

  it('installs an openToast implementation', () => {
    const impl = vi.fn().mockReturnValue('open-id');
    configureMessages({ openToast: impl });
    expect(openToast({ type: 'info' })).toBe('open-id');
  });

  it('installs a clearAllToasts implementation', () => {
    const impl = vi.fn();
    configureMessages({ clearAllToasts: impl });
    clearAllToasts();
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('partial overrides merge with existing services, not the baseline defaults alone', () => {
    const showAlertImpl = vi.fn().mockResolvedValue('alert-ok');
    configureMessages({ showAlert: showAlertImpl });
    // Leave showConfirm alone — the previously configured stub should still work.
    const showConfirmImpl = vi.fn().mockResolvedValue(true);
    configureMessages({ showConfirm: showConfirmImpl });

    return Promise.all([showAlert({}), showConfirm({})]).then(([a, c]) => {
      expect(showAlertImpl).toHaveBeenCalledTimes(1);
      expect(showConfirmImpl).toHaveBeenCalledTimes(1);
      expect(a).toBe('alert-ok');
      expect(c).toBe(true);
    });
  });
});

describe('MessageServices interface shape', () => {
  it('allows implementations to be passed as a complete services object', () => {
    const full: MessageServices = {
      showAlert: vi.fn().mockResolvedValue(undefined),
      showConfirm: vi.fn().mockResolvedValue(false),
      showSuccess: vi.fn(),
      showToast: vi.fn(),
      showError: vi.fn(),
      openToast: vi.fn(),
      clearAllToasts: vi.fn(),
    };
    expect(() => configureMessages(full)).not.toThrow();
  });
});

describe('ShowError stub', () => {
  it('is a function component that renders null', () => {
    // ShowError renders nothing — assert it exists and is callable.
    expect(typeof ShowError).toBe('function');
    // Invoke it with empty props; React.FC returns ReactNode.
    const result = (ShowError as (p: Record<string, unknown>) => unknown)({});
    expect(result).toBeNull();
  });
});
