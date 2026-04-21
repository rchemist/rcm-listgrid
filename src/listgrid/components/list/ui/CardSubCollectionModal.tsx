'use client';

import React, { useMemo } from 'react';
import { Modal } from '../../../ui';
import { ViewEntityForm } from '../../form/ViewEntityForm';
import { EntityForm } from '../../../config/EntityForm';
import { CardSubCollectionRelation } from '../../../config/CardSubCollectionField';

export type CardSubCollectionModalMode = 'view' | 'edit' | 'create' | null;

export interface CardSubCollectionModalProps {
  /** Is modal opened */
  isOpen: boolean;
  /** Entity form definition for the subcollection */
  entityForm: EntityForm;
  /** Parent entity form */
  parentEntityForm: EntityForm;
  /** Item ID being edited (null for create mode) */
  itemId?: string | null;
  /** Relation configuration */
  relation: CardSubCollectionRelation;
  /** Modal mode: view, edit, or create */
  mode?: CardSubCollectionModalMode;
  /** Called when modal closes */
  onClose: () => void;
  /** Called after successful save */
  onSave?: () => void;
  /** Called after successful delete */
  onDelete?: () => void;
  /** Readonly mode (for view mode) */
  readonly?: boolean;
  /** Allow delete action */
  allowDelete?: boolean;
}

/**
 * CardSubCollectionModal
 * Modal for viewing/editing/creating a card subcollection item
 * Supports three modes:
 * - view: Read-only display of item data
 * - edit: Edit existing item
 * - create: Create new item with mappedBy field auto-populated
 */
export const CardSubCollectionModal: React.FC<CardSubCollectionModalProps> = ({
  isOpen,
  entityForm,
  parentEntityForm,
  itemId,
  relation,
  mode = 'view',
  onClose,
  onSave,
  onDelete,
  readonly = false,
  allowDelete = true,
}) => {
  // Get the mappedBy field name (first part of the path)
  const mappedByFieldName = useMemo(() => {
    const mappedBy = relation.mappedBy;
    return mappedBy.split('.')[0];
  }, [relation.mappedBy]);

  // Get the value to set for mappedBy field
  const mappedByValue = useMemo(() => {
    const valueProperty = relation.valueProperty ?? 'id';
    if (valueProperty === 'id') {
      return parentEntityForm.id;
    }
    return parentEntityForm.getValue(valueProperty);
  }, [relation.valueProperty, parentEntityForm]);

  // Create entity form instance for the item
  const itemEntityForm = useMemo(() => {
    if (mode === 'create') {
      // Create mode: clone the form and set mappedBy value
      const cloned = entityForm.clone(true);
      // Set the mappedBy field value for the new item
      if (mappedByFieldName && mappedByValue) {
        cloned.setValue(mappedByFieldName, mappedByValue);
      }
      return cloned;
    } else {
      // View/Edit mode: clone with the existing item ID (may be null in non-render states; early-returned before render)
      return entityForm.clone(true).withId(itemId ?? undefined);
    }
  }, [entityForm, itemId, mode, mappedByFieldName, mappedByValue]);

  // Modal title based on mode
  const modalTitle = useMemo(() => {
    switch (mode) {
      case 'create':
        return 'Add New Item';
      case 'edit':
        return 'Edit Item';
      case 'view':
      default:
        return 'View Item';
    }
  }, [mode]);

  // Don't render if not open
  if (!isOpen) return null;

  // For view/edit mode, itemId is required
  if ((mode === 'view' || mode === 'edit') && !itemId) return null;

  // Determine exclude buttons based on mode
  const excludeButtons: string[] = [];
  if (!allowDelete || mode === 'view' || mode === 'create') {
    excludeButtons.push('delete');
  }

  return (
    <Modal
      opened={true}
      view={{ title: false }}
      size="5xl"
      animation="none"
      position="center"
      closeOnClickOutside={false}
      closeOnEscape={true}
      onClose={onClose}
    >
      <ViewEntityForm
        entityForm={itemEntityForm}
        key={mode === 'create' ? 'create-new' : itemId}
        subCollection={true}
        readonly={readonly || mode === 'view'}
        excludeButtons={excludeButtons}
        {...(mappedByFieldName !== undefined ? { hideMappedByFields: mappedByFieldName } : {})}
        buttonLinks={{
          onClickList: async () => {
            onClose();
          },
        }}
        postSave={async (entityForm) => {
          onSave?.();
          onClose();
          return entityForm;
        }}
        postDelete={async () => {
          onDelete?.();
          onClose();
        }}
      />
    </Modal>
  );
};

export default CardSubCollectionModal;
