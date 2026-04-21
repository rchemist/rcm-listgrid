'use client';
import { QueryConditionType } from '../../../form/SearchForm';
import { EntityForm } from '../../../config/EntityForm';
import { isTrue } from '../../../utils/BooleanUtil';
import { ReactNode, useEffect, useState } from 'react';
import { ListableFormField } from '../../fields/abstract';

interface FilterViewProps {
  entityForm: EntityForm;
  field: ListableFormField<any>;
  value?: any;
  resetValue?: boolean;
  onChange: (name: string, value: any, op?: QueryConditionType) => void;
}

export const FilterView = ({ entityForm, field, value, resetValue, onChange }: FilterViewProps) => {
  const [view, setView] = useState<ReactNode>(undefined);

  useEffect(() => {
    if (field.isFilterable()) {
      (async () => {
        const view = await field.viewListFilter({
          entityForm: entityForm,
          onChange: (value, op) => onChange(field.getName(), value, op),
          value: isTrue(resetValue) ? undefined : value,
        });
        setView(view);
      })();
    }
  }, []);

  if (view === undefined || view == null) return null;

  return <div>{view}</div>;
};
