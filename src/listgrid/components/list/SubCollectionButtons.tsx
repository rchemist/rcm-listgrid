'use client';

import React, { useEffect, useState } from 'react';
import { EntityForm } from '../../config/EntityForm';
import { isTrue } from '../../utils/BooleanUtil';
import { useServerSideCache } from './types/ListGridHeader.types';
import { SubCollectionButtonsProps } from './types/SubCollectionButtons.type';
import { PriorityButtons } from './ui/buttons/PriorityButton';
import { SubCollectionModal } from './ui/SubCollectionModal';
import { CacheClearButton } from './ui/buttons/CacheClearButton';
import { CreateButton } from './ui/buttons/CreateButton';
import { useListGridTheme } from './context/ListGridThemeContext';

export const SubCollectionButtons = (props: SubCollectionButtonsProps) => {
  const {
    activeTrashIcon,
    deleteItems,
    onRefresh,
    mappedBy,
    mappedValue,
    collectionName,
    setErrors,
    setNotifications,
    createOrUpdate,
  } = props;

  const [open, setOpen] = useState<boolean>(false);
  const [renderKey, setRenderKey] = useState(new Date().getTime());
  const [entityForm, setEntityForm] = useState<EntityForm>(props.entityForm.clone(true));
  const [managePriority, setManagePriority] = useState<boolean>(false);

  const ableAdd = isTrue(props.add, true);
  const ableDelete = isTrue(props.delete, true);
  const viewable = true; //ableAdd || ableDelete;

  const cacheable = isTrue(props.cacheable) && useServerSideCache;
  const { classNames: themeClasses } = useListGridTheme();

  useEffect(() => {
    if (collectionName) {
      entityForm.withTitle(
        `${collectionName} ${entityForm.getRenderType() === 'create' ? '추가' : '수정'}`,
      );
    }

    if (mappedBy !== undefined) {
      entityForm.withOverrideSubmitData(async (_entityForm, data) => {
        data[mappedBy] = mappedValue;
        return { data };
      });
    }
  }, [collectionName, mappedBy, mappedValue, entityForm]);

  if (!viewable) return null;

  return (
    <div className={themeClasses.subCollectionButtons?.container ?? 'rcm-action-bar-end'}>
      {props.supportPriority && (
        <PriorityButtons
          managePriority={managePriority}
          setManagePriority={setManagePriority}
          setParentManagePriority={props.setManagePriority}
          {...(props.rows !== undefined ? { rows: props.rows } : {})}
          entityForm={props.entityForm}
          setNotifications={setNotifications}
          setErrors={setErrors}
        />
      )}
      {cacheable && (
        <CacheClearButton
          entityForm={props.entityForm}
          setNotifications={setNotifications}
          setErrors={setErrors}
          onRefresh={onRefresh}
        />
      )}
      <CreateButton
        ableDelete={ableDelete}
        activeTrashIcon={activeTrashIcon}
        deleteItems={deleteItems}
        {...(props.buttons !== undefined ? { buttons: props.buttons } : {})}
        buttonProps={props}
        ableAdd={ableAdd}
        setOpen={setOpen}
        setRenderKey={setRenderKey}
      />
      <SubCollectionModal
        open={open}
        setOpen={setOpen}
        renderKey={renderKey}
        entityForm={entityForm}
        {...(createOrUpdate !== undefined ? { createOrUpdate } : {})}
        onNotifications={setNotifications}
        onErrors={setErrors}
        onRefresh={onRefresh}
        {...(mappedBy !== undefined ? { mappedBy } : {})}
      />
    </div>
  );
};
