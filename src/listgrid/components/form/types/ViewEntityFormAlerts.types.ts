import { AlertMessage, AlertMessageLink } from '../../../config/EntityFormTypes';
import { ComponentType, SVGProps } from 'react';

export interface ViewEntityFormAlertsProps {
  alertMessages: AlertMessage[];
  onRemove?: (key: string) => void;
  onTabChange?: (tabId: string) => void;
  onFieldFocus?: (fieldName: string) => void;
}

export interface AlertStyles {
  /** Icon component (e.g. Tabler icons) — accepts standard SVG/icon props. */
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; stroke?: number }>;
  /** Primitive class to apply on the alert root (`rcm-notice`). */
  className: string;
  /** Value for the `data-tone` attribute on the alert root, or undefined for neutral. */
  dataTone?: 'info' | 'success' | 'warning' | 'error';
}

export interface AlertItemProps {
  alert: AlertMessage;
  onLinkClick: (link: AlertMessageLink) => void;
  onClose: (key: string) => void;
  t: (key: string) => string;
}

export type AlertColor =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'secondary'
  | 'primary'
  | 'dark';
