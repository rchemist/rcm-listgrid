import React from 'react';
import { ApiSpecification } from './Type';
import { Tooltip } from '../../ui';
import Swal from 'sweetalert2';
import { IconCopyCheck } from '@tabler/icons-react';

export const ViewApiSpecification = ({
  method,
  response,
  formData,
  ...props
}: ApiSpecification) => {
  const url = props.url;

  return (
    <div className="rcm-api-spec">
      <div>
        <ShowTitle copyText={`${url}`} label={'API URL'}></ShowTitle>
        <div className="rcm-api-spec-url-row">
          <div className="rcm-api-spec-method">{method}</div>
          <div id="addonsRightoutline" className="rcm-api-spec-url">
            {url}
          </div>
        </div>
      </div>
      {formData && (
        <div>
          <ShowTitle copyText={`${formData}`} label={'Form Data'}></ShowTitle>
          <div className="rcm-api-spec-block">
            <div>
              <pre>{String(formData)}</pre>
            </div>
          </div>
        </div>
      )}
      <div>
        <ShowTitle copyText={`${response}`} label={'API 응답 결과'}></ShowTitle>
        <div className="rcm-api-spec-block">
          <div>
            <pre>{response}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShowTitle = ({ copyText, label }: { copyText: string; label: string }) => {
  return (
    <div className={'flex items-center space-x-2'}>
      <label>{label}</label>
      <Tooltip
        label={`버튼을 누르면 데이터를 클립보드로 복사합니다.`}
        zIndex={10000}
        className={'cursor-pointer'}
        color={'indigo'}
        position={'right-end'}
      >
        <button
          className={'w-[24px] h-[24px]'}
          onClick={() => {
            try {
              navigator.clipboard.writeText(copyText);
              showMessage('클립보드에 복사되었습니다.');
            } catch (error) {
              showMessage('클립보드에 복사 실패했습니다.');
            }
          }}
        >
          <IconCopyCheck className={'w-4 h-4 mb-2'}></IconCopyCheck>
        </button>
      </Tooltip>
    </div>
  );
};

const showMessage = (message: string = '') => {
  const toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 1000,
  });
  toast.fire({
    icon: 'success',
    title: message || '클립보드에 복사 되었습니다.',
    padding: '10px 20px',
  });
};
