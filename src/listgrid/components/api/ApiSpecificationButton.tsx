'use client';
import { ReactNode, useState } from 'react';
import { ApiSpecification, isApiSpecification } from './Type';
import { Modal } from '../../ui';
import { ViewApiSpecification } from './ViewApiSpecification';
import { IconApi } from '@tabler/icons-react';

export const ApiSpecificationButton = ({ apiSpec }: { apiSpec?: ApiSpecification | ReactNode }) => {
  const [open, setOpen] = useState(false);

  if (apiSpec === undefined) {
    return null;
  }

  return (
    <div className={'ml-2'}>
      <button
        className={'btn-outline-info rounded-full w-[24px] h-[24px]'}
        onClick={() => setOpen(true)}
      >
        <IconApi className={'w-6 h-6'} />
      </button>
      {open && (
        <>
          <Modal
            opened={open}
            title={'API 상세 정보'}
            position={'top-center'}
            closeOnClickOutside={true}
            closeOnEscape={true}
            onClose={() => {
              setOpen(false);
            }}
          >
            {isApiSpecification(apiSpec) ? (
              <ViewApiSpecification {...apiSpec} />
            ) : (
              (apiSpec as ReactNode)
            )}
          </Modal>
        </>
      )}
    </div>
  );
};
