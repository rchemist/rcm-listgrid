import React from "react";
import {ApiSpecification} from './Type';
import {Tooltip} from "../../ui";
import Swal from "sweetalert2";
import {IconCopyCheck} from "@tabler/icons-react";


export const ViewApiSpecification = ({method, response, formData, ...props}: ApiSpecification) => {

  const url = props.url;

  return <div className={'space-y-6'}>
    <div>
      <ShowTitle copyText={`${url}`} label={'API URL'}></ShowTitle>
      <div className="flex">
        <div
          className="bg-[#f1f2f3] dark:bg-[#1b2e4b] text-sm flex justify-center items-center rounded-l-md px-3 font-semibold border border-r-0 border-white-light dark:border-[#17263c]">
          {method}
        </div>
        <div id="addonsRightoutline"
             className="form-input rounded-r-md rounded-l-none">
          {url}
        </div>
      </div>
    </div>
    {formData && <div>
      <ShowTitle copyText={`${formData}`} label={'Form Data'}></ShowTitle>
      <div className={'form-input font-normal bg-[#f1f2f3]/[50%] dark:bg-[#1b2e4b]'}>
        <div>
          {/*@ts-ignore*/}
          <pre>{formData}</pre>
        </div>

      </div>
    </div>}
    <div>
      <ShowTitle copyText={`${response}`} label={'API 응답 결과'}></ShowTitle>
      <div className={'form-input font-normal bg-[#f1f2f3]/[50%] dark:bg-[#1b2e4b]'}>
        <div>
          <pre>{response}</pre>
        </div>
      </div>
    </div>

  </div>
    ;

}

const ShowTitle = ({copyText, label}: {copyText: string, label: string}) => {

  return <div className={'flex items-center space-x-2'}>
    <label>{label}</label>
    <Tooltip label={`버튼을 누르면 데이터를 클립보드로 복사합니다.`} zIndex={10000} className={'cursor-pointer'} color={'indigo'} position={'right-end'}>
        <button className={'w-[24px] h-[24px]'} onClick={() => {
          try {
            navigator.clipboard.writeText(copyText);
            showMessage('클립보드에 복사되었습니다.');
          } catch (error) {
            showMessage('클립보드에 복사 실패했습니다.');
          }
        }}>
          <IconCopyCheck className={'w-4 h-4 mb-2'}></IconCopyCheck>
        </button>
      </Tooltip>
  </div>

}


const showMessage = (message: String = '') => {
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
