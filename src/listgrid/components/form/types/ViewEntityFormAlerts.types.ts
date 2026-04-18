/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {AlertMessage, AlertMessageLink} from '../../../config/EntityFormTypes';
import {ComponentType, SVGProps} from "react";

export interface ViewEntityFormAlertsProps {
  alertMessages: AlertMessage[];
  onRemove?: (key: string) => void;
  onTabChange?: (tabId: string) => void;
  onFieldFocus?: (fieldName: string) => void;
}

export interface AlertStyles {
  /**
   * @deprecated Use `className` + `dataTone`. Kept for backward-compatibility;
   * now returns `'rcm-notice'` without tone modifier classes.
   */
  bg: string;
  hoverBg: string;
  text: string;
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

export type AlertColor = 'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'primary' | 'dark';