import { EntityForm } from '../../../config/EntityForm';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import React from 'react';
import { IconExternalLink } from '@tabler/icons-react';
import { useModalManagerStore } from '../../../store';

interface ManyToOneListViewProps {
  id?: string;
  value: string;
  entityForm: EntityForm;
}

export const ManyToOneListView = ({ value, id, entityForm }: ManyToOneListViewProps) => {
  const { openModal, closeModal } = useModalManagerStore();

  return (
    <div>
      <div className={'flex space-x-1 items-center'}>
        <span>{value}</span>
        {id && (
          <button
            className={'w-6 h-6'}
            onClick={(e) => {
              e.stopPropagation();
              const modalId = `many-to-one-list-view-${id}`;
              const viewEntityForm: EntityForm = entityForm.clone(true).withId(id);

              if (viewEntityForm.title === undefined) {
                viewEntityForm.withTitle('정보 조회');
              }

              openModal({
                modalId,
                title: `View ${value}`,
                size: '5xl',
                content: (
                  <ViewEntityForm
                    entityForm={viewEntityForm}
                    buttonLinks={{
                      onClickList: async () => {
                        closeModal(modalId);
                      },
                    }}
                    subCollection={true}
                    readonly={true}
                  />
                ),
              });
            }}
          >
            <IconExternalLink className={'w-4 h-4'} />
          </button>
        )}
      </div>
    </div>
  );
};
