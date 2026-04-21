'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { QueryConditionType } from '../../../form/SearchForm';
import { EntityForm } from '../../../config/EntityForm';
import { ListableFormField } from '../../fields/abstract';
import { getTranslation } from '../../../utils/i18n';

interface MemoizedFilterFieldProps {
  entityForm: EntityForm;
  field: ListableFormField<any>;
  fieldName: string;
  value: any;
  onChange: (name: string, value: any, op?: QueryConditionType) => void;
  isCompact?: boolean;
}

/**
 * Memoized filter field component for performance optimization
 * Only re-renders when props actually change
 */
const MemoizedFilterFieldInner = ({
  entityForm,
  field,
  fieldName,
  value,
  onChange,
  isCompact = false,
}: MemoizedFilterFieldProps) => {
  const [filterView, setFilterView] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const { t } = getTranslation();

  // Memoized change handler to prevent unnecessary re-renders
  const handleChange = useCallback(
    (newValue: any, op?: QueryConditionType) => {
      onChange(fieldName, newValue, op);
    },
    [fieldName, onChange],
  );

  // Load filter view only once on mount
  useEffect(() => {
    mountedRef.current = true;

    const loadFilterView = async () => {
      if (!field.isFilterable()) {
        setIsLoading(false);
        return;
      }

      try {
        const view = await field.viewListFilter({
          entityForm,
          onChange: handleChange,
          value,
        });

        if (mountedRef.current) {
          setFilterView(view);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load filter view:', error);
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadFilterView();

    return () => {
      mountedRef.current = false;
    };
  }, [field, entityForm, handleChange, value]);

  if (isLoading) {
    return <div className={`animate-pulse ${isCompact ? 'h-8' : 'h-10'} bg-gray-100 rounded`} />;
  }

  if (!filterView) {
    return null;
  }

  return (
    <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
      <label
        htmlFor={fieldName}
        className={`flex items-center text-gray-700 font-medium ${
          isCompact ? 'text-xs' : 'text-sm'
        }`}
      >
        {field.viewLabel(t)}
      </label>
      <div className={isCompact ? 'filter-field-compact' : ''}>{filterView}</div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MemoizedFilterField = memo(MemoizedFilterFieldInner, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these props change
  return (
    prevProps.fieldName === nextProps.fieldName &&
    prevProps.value === nextProps.value &&
    prevProps.isCompact === nextProps.isCompact &&
    // Reference equality for stable objects
    prevProps.entityForm === nextProps.entityForm &&
    prevProps.field === nextProps.field
  );
});

MemoizedFilterField.displayName = 'MemoizedFilterField';
