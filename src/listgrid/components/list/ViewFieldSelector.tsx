import React from 'react';
import { ListableFormField } from '../fields/abstract';
import { Popover } from '../../ui';
import { Tooltip } from '../../ui';
import { getTranslation } from '../../utils/i18n';
import { ViewFieldManageable } from './types/ViewListGrid.types';
import { setListFieldsToCache } from '../../config/ListGridViewFieldCache';

interface ViewFieldSelectorProps extends ViewFieldManageable {
  fields: ListableFormField<any>[];
  disabled: boolean;
  entityUrl: string;
  subCollectionName?: string;
}

export const ViewFieldSelector = ({
  viewFields,
  setViewFields,
  ...props
}: ViewFieldSelectorProps) => {
  const { t } = getTranslation();
  const fields = props.fields;

  function isChecked(fieldName: string): boolean {
    return viewFields.length === 0 || viewFields.includes(fieldName);
  }

  const syncViewFieldsToCache = (fieldName: string) => {
    let newFieldNames: string[] = [...viewFields];
    if (viewFields.length === 0) {
      // find field.name except equals fieldName
      newFieldNames = fields.map((field) => field.name);
      newFieldNames.splice(newFieldNames.indexOf(fieldName), 1);

      if (newFieldNames.length === 0) {
        // 건드리면 안 된다.
        return;
      }
    } else {
      const index = newFieldNames.indexOf(fieldName);
      if (index === -1) {
        newFieldNames.push(fieldName);
      } else {
        // remove from viewFields
        newFieldNames.splice(index, 1);
      }
    }

    setViewFields?.([...newFieldNames]);

    // localStorage에 저장
    setListFieldsToCache(props.entityUrl, props.subCollectionName, newFieldNames);
  };

  if (fields.length < 2) {
    // 필드 셀렉터를 표시하지 않는다.
    return null;
  }

  const maxWidth = `max-w-[240px] sm:max-w-none`;

  const gridCols = `grid-cols-2 sm:grid-cols-3`;

  return (
    <React.Fragment>
      <Popover position={'bottom'} shadow={'md'} closeOnClickOutside={true}>
        <Popover.Target>
          <Tooltip label={'원하는 필드만 표시할 수 있습니다.'}>
            <button
              className={'btn btn-outline-primary whitespace-nowrap'}
              disabled={props.disabled}
            >
              목록 설정
            </button>
          </Tooltip>
        </Popover.Target>
        <Popover.Dropdown>
          <div className={`w-full grid ${gridCols} gap-2 ${maxWidth} p-4`}>
            {fields.map((field) => {
              const checked = isChecked(field.name);

              return (
                <div
                  className={'flex whitespace-nowrap space-x-2 mr-2'}
                  key={`checkbox_${field.getName()}`}
                >
                  <label
                    className={
                      'cursor-pointer !font-normal !text-sm text-gray-700 dark:text-gray-200'
                    }
                  >
                    <input
                      type={'checkbox'}
                      className={'form-checkbox !w-4 !h-4'}
                      checked={checked}
                      onChange={() => syncViewFieldsToCache(field.getName())}
                    />
                    <span className="whitespace-nowrap">{field.viewLabel(t)}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </Popover.Dropdown>
      </Popover>
    </React.Fragment>
  );
};
