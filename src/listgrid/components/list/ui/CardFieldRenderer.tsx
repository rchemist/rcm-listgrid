'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { EntityField, ViewValueResult } from '../../../config/EntityField';
import { FieldType } from '../../../config/Config';
import { Session } from '../../../auth/types';

// Field types that should span full width in the card grid
const FULL_WIDTH_FIELD_TYPES: FieldType[] = ['textarea', 'html', 'markdown', 'contentAsset'];

export interface CardFieldRendererProps {
  /** Form field to render */
  field: EntityField;
  /** Item data */
  item: any;
  /** Entity form instance for the item */
  itemEntityForm: EntityForm;
  /** Parent entity form */
  parentEntityForm: EntityForm;
  /** User session */
  session?: Session;
  /** Whether this field should use full width (col-span-2) */
  isFullWidth?: boolean;
}

/**
 * Determines if a field type should span the full width of the card
 */
export const isFullWidthFieldType = (fieldType: FieldType): boolean => {
  return FULL_WIDTH_FIELD_TYPES.includes(fieldType);
};

/**
 * CardFieldRenderer
 * Displays a field value in VIEW mode (read-only formatted)
 * Uses field.viewValue() to leverage each field type's formatting logic
 * (e.g., NumberField uses formatPrice, SelectField uses Badge)
 */
export const CardFieldRenderer: React.FC<CardFieldRendererProps> = ({
  field,
  item,
  itemEntityForm,
  parentEntityForm,
  session,
  isFullWidth,
}) => {
  // State for the rendered value
  const [renderedValue, setRenderedValue] = useState<React.ReactNode>('—');
  const [isLoading, setIsLoading] = useState(true);

  // Determine if this field should be full width
  const shouldBeFullWidth = useMemo(() => {
    return isFullWidth ?? isFullWidthFieldType(field.type);
  }, [field.type, isFullWidth]);

  // Get field label
  const label = useMemo(() => {
    const fieldLabel = field.getLabel();
    if (typeof fieldLabel === 'string') {
      return fieldLabel;
    }
    return field.getName();
  }, [field]);

  // Use field.viewValue() to get properly formatted value
  useEffect(() => {
    let isMounted = true;

    const renderValue = async () => {
      try {
        // Call field's viewValue method for proper formatting
        const result: ViewValueResult = await field.viewValue({
          item,
          entityForm: itemEntityForm,
        });

        if (isMounted) {
          setRenderedValue(result.result ?? '—');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('CardFieldRenderer: Error rendering field value:', error);
        if (isMounted) {
          // Fallback to raw value display
          const rawValue = item[field.getName()];
          setRenderedValue(rawValue !== undefined && rawValue !== null ? String(rawValue) : '—');
          setIsLoading(false);
        }
      }
    };

    renderValue();

    return () => {
      isMounted = false;
    };
  }, [field, item, itemEntityForm]);

  return (
    <div
      className={`
        group/field flex flex-col py-2.5
        ${shouldBeFullWidth ? 'col-span-2' : ''}
      `}
    >
      {/* Label */}
      <dt
        className="
        text-[11px] font-medium uppercase tracking-wider
        text-gray-400
        mb-1
        transition-colors duration-150
        group-hover/field:text-gray-500
        dark:text-gray-500
        dark:group-hover/field:text-gray-400
      "
      >
        {label}
      </dt>

      {/* Value */}
      <dd
        className="
        text-[13px] font-medium leading-relaxed
        text-gray-700 dark:text-gray-200
        min-h-[20px]
      "
      >
        {isLoading ? (
          <span
            className="
            inline-block h-5 w-24
            animate-pulse rounded-md
            bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100
            dark:from-gray-800 dark:via-gray-700 dark:to-gray-800
            bg-[length:200%_100%]
          "
          />
        ) : (
          <span
            className={`
            ${shouldBeFullWidth ? 'whitespace-pre-wrap break-words' : 'line-clamp-2'}
          `}
          >
            {renderedValue}
          </span>
        )}
      </dd>
    </div>
  );
};

export default CardFieldRenderer;
