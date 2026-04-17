'use client';

import React, { useEffect, useState, useMemo, ReactNode } from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { EntityField } from '../../../config/EntityField';
import { EntityFieldGroup } from '../../../config/EntityFieldGroup';
import { FormField } from '../../fields/abstract';
import { Session } from '../../../auth/types';
import { IconChevronUp, IconInfoCircle, IconHelp } from '@tabler/icons-react';
import { Tooltip } from '../../../ui';
import { Icon } from '@iconify/react';
import { isBlank } from '../../../utils/StringUtil';

/**
 * CardFieldRow - Horizontal label/value layout for card display
 * Follows FieldRenderer logic for complete field information display:
 * - Label with required indicator
 * - Tooltip support
 * - HelpText support
 * - Value display with viewValue()
 */
interface CardFieldRowProps {
  field: FormField<any>;
  item: any;
  entityForm: EntityForm;
  session?: Session;
}

const CardFieldRow: React.FC<CardFieldRowProps> = ({ field, item, entityForm, session }) => {
  const [renderedValue, setRenderedValue] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [required, setRequired] = useState(false);
  const [tooltip, setTooltip] = useState<ReactNode>('');
  const [helpText, setHelpText] = useState<ReactNode>('');

  const label = useMemo(() => {
    const fieldLabel = field.getLabel();
    return typeof fieldLabel === 'string' ? fieldLabel : field.getName();
  }, [field]);

  // Load field properties (required, tooltip, helpText) following FieldRenderer pattern
  useEffect(() => {
    let isMounted = true;

    const loadFieldProperties = async () => {
      try {
        // Get required status
        const isRequired = await field.isRequired({ entityForm, session });
        if (isMounted) setRequired(isRequired);

        // Get tooltip
        const tooltipValue = await field.getTooltip({ entityForm, session });
        if (isMounted) setTooltip(tooltipValue);

        // Get helpText
        const helpTextValue = await field.getHelpText({ entityForm, session });
        if (isMounted) setHelpText(helpTextValue);
      } catch (error) {
        console.error('Error loading field properties:', error);
      }
    };

    loadFieldProperties();
    return () => { isMounted = false; };
  }, [field, entityForm, session]);

  // Render field value
  useEffect(() => {
    let isMounted = true;

    const renderValue = async () => {
      try {
        // Pass compact: true to skip icons in card context
        const result = await field.viewValue({ item, entityForm, compact: true });

        if (isMounted) {
          // Keep the result as-is; show placeholder for empty values
          if (result.result === null || result.result === '—' || result.result === '-' || result.result === '') {
            setRenderedValue('—'); // Show placeholder for empty values
          } else {
            setRenderedValue(result.result);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setRenderedValue('—'); // Show placeholder on error
          setIsLoading(false);
        }
      }
    };

    renderValue();
    return () => { isMounted = false; };
  }, [field, item, entityForm]);

  const showTooltip = !isBlank(tooltip);
  const showHelpText = !isBlank(helpText);

  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0">
      {/* Label Column - Takes 1/3 of space */}
      <dt className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>{label}</span>
        {/* Required indicator */}
        {required && (
          <Tooltip label="필수값" color="red" withArrow>
            <Icon
              icon="healthicons:star-small"
              className="cursor-help text-red-600 w-2.5 h-2.5"
            />
          </Tooltip>
        )}
        {/* Tooltip indicator */}
        {showTooltip && (
          <Tooltip label={tooltip} color="gray" withArrow position="top-end">
            <IconHelp className="h-3 w-3 text-gray-400 cursor-help" />
          </Tooltip>
        )}
      </dt>
      {/* Value Column - Takes 2/3 of space */}
      <dd className="col-span-2 text-sm text-gray-900 dark:text-gray-100">
        {isLoading ? (
          <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        ) : (
          <div className="space-y-1">
            <div>{renderedValue}</div>
            {/* Help text display */}
            {showHelpText && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {helpText}
              </div>
            )}
          </div>
        )}
      </dd>
    </div>
  );
};

/**
 * CardFieldSection - Renders a FieldGroup as an independent card
 * Each FieldGroup is visually separated with its own container
 * Follows ViewFieldGroup logic for:
 * - Collapsable support
 * - Description with help icon
 * - Session-aware visibility
 */
export interface CardFieldSectionProps {
  /** EntityFieldGroup to render */
  fieldGroup: EntityFieldGroup;
  /** Fields within this group */
  fields: EntityField[];
  /** Item data */
  item: any;
  /** EntityForm instance (with id set for proper visibility) */
  entityForm: EntityForm;
  /** Session for permission/visibility checks */
  session?: Session;
}

export const CardFieldSection: React.FC<CardFieldSectionProps> = ({
  fieldGroup,
  fields,
  item,
  entityForm,
  session,
}) => {
  // Collapsable state (following ViewFieldGroup pattern)
  const [isOpen, setIsOpen] = useState(() => fieldGroup.config?.open ?? true);

  // Filter to only FormFields (visibility is already determined by EntityForm.getVisibleFields())
  // Do NOT filter by value - EntityForm's visibility settings should be respected
  const visibleFields = useMemo(() => {
    return fields.filter((field): field is FormField<any> => {
      return field instanceof FormField;
    });
  }, [fields]);

  // Don't render empty sections
  if (visibleFields.length === 0) {
    return null;
  }

  // Check if this is a labeled group (has a non-empty label)
  const hasLabel = fieldGroup.label && fieldGroup.label.trim() !== '';

  // Check if group has description for help icon
  const hasDescription = !isBlank(fieldGroup.description);

  // Toggle collapse state
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 overflow-hidden">
      {/* Section Header - Only show if group has a label */}
      {hasLabel && (
        <div
          className="px-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {fieldGroup.label}
            </h4>
            <div className="flex items-center gap-2">
              {/* Help icon for description (following ViewFieldGroup pattern) */}
              {hasDescription && (
                <Tooltip label={fieldGroup.description} color="gray" withArrow position="top-end">
                  <IconInfoCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </Tooltip>
              )}
              {/* Collapse toggle icon */}
              <button
                type="button"
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                <IconChevronUp
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isOpen ? '' : 'rotate-180'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fields - Collapsable content */}
      {isOpen && (
        <dl className="px-4 py-2">
          {visibleFields.map((field) => (
            <CardFieldRow
              key={field.getName()}
              field={field}
              item={item}
              entityForm={entityForm}
              session={session}
            />
          ))}
        </dl>
      )}
    </div>
  );
};

export default CardFieldSection;
