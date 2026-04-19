import { Modal } from '../../../ui';
import { isTrue } from '../../../utils/BooleanUtil';
import React from 'react';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import { EntityForm } from '../../../config/EntityForm';
import { ViewListGridProps } from '../types/ViewListGrid.types';
import { SearchForm } from '../../../form/SearchForm';

export const SubCollectionViewModal = ({
  entityForm,
  managedId,
  props,
  setManagedId,
  fetchData,
  setOpenBaseLoading,
  mappedBy,
}: {
  entityForm: EntityForm;
  managedId: string | undefined;
  props: ViewListGridProps;
  setManagedId: React.Dispatch<React.SetStateAction<string | undefined>>;
  fetchData: (form?: SearchForm) => void;
  setOpenBaseLoading: (open: boolean) => void;
  mappedBy?: string;
}) => {
  if (!managedId) return null;

  const collectionEntityForm = entityForm.withId(managedId);

  const excludeButtons: string[] = [];

  const readonly =
    isTrue(props.options?.readonly) || !isTrue(props.options?.subCollection?.modifyOnView, true);

  if (!isTrue(props.options?.subCollection?.delete, true)) {
    excludeButtons.push('delete');
  }

  return (
    <React.Fragment>
      <Modal
        opened={true}
        view={{ title: false }}
        size="5xl"
        animation={'none'}
        position="center"
        closeOnClickOutside={false}
        closeOnEscape={false}
        onClose={() => {
          setManagedId(undefined);
        }}
      >
        <ViewEntityForm
          entityForm={collectionEntityForm}
          key={managedId}
          subCollection={true}
          readonly={readonly}
          excludeButtons={excludeButtons}
          {...(mappedBy !== undefined ? { hideMappedByFields: mappedBy } : {})}
          buttonLinks={{
            onClickList: async () => {
              setManagedId(undefined);
            },
          }}
          postSave={() => {
            // 저장이 완료된 경우에는 리프레시 한다.
            return new Promise(() => {
              setManagedId(undefined);
              fetchData();
              setOpenBaseLoading(false);
            });
          }}
          postDelete={async () => {
            setManagedId(undefined);
            fetchData();
            setOpenBaseLoading(false);
          }}
        />
      </Modal>
    </React.Fragment>
  );
};
