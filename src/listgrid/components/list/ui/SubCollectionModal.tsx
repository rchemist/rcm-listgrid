import { EntityForm } from '../../../config/EntityForm';
import { CreateUpdateOptions } from '../types/ViewListGrid.types';
import { Modal } from '../../../ui';
import { ViewEntityForm } from '../../form/ViewEntityForm';

export interface SubCollectionModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  renderKey: number;
  entityForm: EntityForm;
  createOrUpdate?: CreateUpdateOptions;
  onNotifications: (notifications: string[]) => void;
  onErrors: (errors: string[]) => void;
  onRefresh: () => void;
  /** MappedBy field name for auto-hiding parent reference fields */
  mappedBy?: string;
}

export const SubCollectionModal: React.FC<SubCollectionModalProps> = ({
  open,
  setOpen,
  renderKey,
  entityForm,
  createOrUpdate,
  onNotifications,
  onErrors,
  onRefresh,
  mappedBy,
}) => {
  if (!open) return null;

  return (
    <Modal
      view={{ title: false }}
      key={renderKey}
      size={'full'}
      animation={'none'}
      closeOnClickOutside={false}
      closeOnEscape={false}
      opened={open}
      onClose={() => setOpen(false)}
    >
      <ViewEntityForm
        entityForm={entityForm}
        subCollection={true}
        {...(mappedBy !== undefined ? { hideMappedByFields: mappedBy } : {})}
        postSave={async (savedEntityForm: EntityForm) => {
          if (createOrUpdate?.onSave) {
            await createOrUpdate.onSave(savedEntityForm);
          }
          setOpen(false);
          return savedEntityForm;
        }}
        buttonLinks={{
          onClickList: async () => setOpen(false),
          onDelete: {
            success: () => {
              setOpen(false);
              onNotifications(['삭제가 완료되었습니다.']);
              onRefresh();
            },
            failed: (result) => {
              onErrors(result.errors ?? []);
              setOpen(false);
            },
          },
          onSave: {
            success: () => {
              setOpen(false);
              onNotifications(['저장이 완료되었습니다.']);
              onRefresh();
            },
          },
        }}
      />
    </Modal>
  );
};
