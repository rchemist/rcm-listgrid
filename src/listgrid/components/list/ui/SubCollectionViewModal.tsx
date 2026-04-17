import {Modal} from "@gjcu/ui/modals";
import {isTrue} from '../../../../utils/BooleanUtil';
import React from "react";
import {ViewEntityForm} from "../../form/ViewEntityForm";
import {EntityForm} from '../../../config/EntityForm';
import {ViewListGridProps} from "../types/ViewListGrid.types";
import {SearchForm} from "@gjcu/ui/form/SearchForm";

export const SubCollectionViewModal = ({entityForm, managedId, props, setManagedId, fetchData, setOpenBaseLoading, mappedBy}: {entityForm: EntityForm, managedId: any, props: ViewListGridProps, setManagedId: React.Dispatch<any>, fetchData: (form?: SearchForm) => void, setOpenBaseLoading: (open: boolean) => void, mappedBy?: string}) => {
    
    if (!managedId) return null;
    
    const collectionEntityForm = entityForm.withId(managedId);
  
    const excludeButtons: string[] = [];
  
    const readonly = isTrue(props.options?.readonly) || !isTrue(props.options?.subCollection?.modifyOnView, true);
  
    if (!isTrue(props.options?.subCollection?.delete, true)) {
      excludeButtons.push('delete');
    }
  
    return (
      <React.Fragment>
        <Modal opened={true}
          view={{ title: false }}
          size="5xl"
          animation={'none'}
          position='center'
          closeOnClickOutside={false}
          closeOnEscape={false}
          onClose={() => {
            console.log('onClose');
            setManagedId(undefined);
          } }>
          <ViewEntityForm entityForm={collectionEntityForm}
            key={managedId}
            subCollection={true}
            readonly={readonly}
            excludeButtons={excludeButtons}
            hideMappedByFields={mappedBy}
            buttonLinks={{
              onClickList: async () => {
                setManagedId(undefined);
              }
            }}
            postSave={() => {
              // 저장이 완료된 경우에는 리프레시 한다.
              return new Promise(() => {
                setManagedId(undefined);
                fetchData();
                setOpenBaseLoading(false);
              });
            } }
            postDelete={async () => {
              setManagedId(undefined);
              fetchData();
              setOpenBaseLoading(false);
            } } />
        </Modal>
      </React.Fragment>
    );
  }
  
  