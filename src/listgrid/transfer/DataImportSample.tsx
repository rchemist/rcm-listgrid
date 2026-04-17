'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {FC, useEffect, useState} from 'react';
import {Table} from "@gjcu/ui/elements/table/Table";
import {SafePerfectScrollbar} from "@gjcu/ui/components/scrollbar/SafePerfectScrollbar";
import {Modal} from "@gjcu/ui/modals";
import {IconFile, IconHelpCircle} from "@tabler/icons-react";
import clsx from "clsx";
import {DataField, SampleDataItem} from '../transfer/Type';
import {DataExportProcessor} from '../transfer/DataExportProcessor';
import {getTranslation} from "@gjcu/ui/utils/i18n";
import {Tooltip} from '@gjcu/ui/elements/tooltip/Tooltip';

export interface DataImportSampleProps {
  sampleFileName?: string;
  fields: DataField[];
  sampleData?: SampleDataItem[][];
  allowUpdate?: boolean;
}

export const DataImportSample: FC<DataImportSampleProps> = ({ sampleFileName: exportFileName, sampleData: initialData, allowUpdate = true, ...props }) => {


  const fields: DataField[] = props.fields.filter((field) => {
    return initialData![0].find((item) => item.name === field.getName()) !== undefined;
  });

  // 업데이트 모드가 허용된 경우에만 id 필드를 노출한다.
  if (allowUpdate && fields.find((field) => field.getName() === 'id') === undefined) {
    // 첫번째 항목으로 추가한다.
    fields.unshift(DataField.create({ name: 'id', label: '아이디', type: 'text' }));
  }


  const { t } = getTranslation();

  const [exportKey, setExportKey] = useState<number>(Date.now());

  const [processing, setProcessing] = useState(false);

  const [sampleData, setSampleData] = useState<SampleDataItem[][]>();

  const hasRequired = fields.find((field) => field.isRequired()) !== undefined;

  useEffect(() => {
    if (initialData && initialData.length > 0) {

      let shouldAddId = allowUpdate;
      if (shouldAddId) {
        const row = initialData[0];
        for (const data of row) {
          if (data.name === 'id') {
            shouldAddId = false;
            break;
          }
        }
      }

      if (shouldAddId && allowUpdate) {
        const newData: SampleDataItem = { name: 'id', value: '' };
        const newDataArray: SampleDataItem[][] = [];

        let index = 0;
        for (const row of initialData) {
          const newRow: SampleDataItem[] = [];
          if (index === 0) {
            newRow.push(newData);
          } else {
            newRow.push({ name: 'id', value: '' });
          }
          for (const data of row) {
            newRow.push(data);
          }
          newDataArray.push(newRow);
          index++;
        }

        setSampleData(newDataArray);
      } else {
        setSampleData(initialData);
      }
    }
  }, []);

  if (sampleData === undefined) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 rounded-lg py-4">
        <p className="text-sm text-gray-700">
          {t('form.list.dataTransfer.tab.import.messages.guide')}
        </p>
        <SampleDataButton exportKey={exportKey} setExportKey={setExportKey}
          setProcessing={setProcessing} processing={processing}
          data={sampleData} fileName={exportFileName} fields={fields} />
      </div>
      {hasRequired && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <span className="text-red-500 font-bold">*</span>
          <span className="text-sm text-amber-800">
            표시가 있는 필드는 필수 항목입니다. 필수 항목을 입력하지 않으면 업로드 되지 않습니다.
          </span>
        </div>
      )}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <SafePerfectScrollbar style={{minWidth: '100%'}}>
          <Table style={{ minWidth: 650 }} aria-label="simple table">
          <Table.Thead>
            <Table.Tr>
              {fields.map((field, index) => {

                return (
                  <Table.Th key={`header_${field.getName()}_${index + 1}`} 
                    className={clsx('bg-indigo-600 text-white text-center py-3 px-4 text-sm font-medium whitespace-nowrap border border-indigo-500', 
                      field.isRequired() && 'font-bold')}>
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        {field.isRequired() && <span className="text-red-300">*</span>}
                        <span className="whitespace-nowrap">{field.getLabel()}</span>
                      </div>
                      <div className="text-xs text-indigo-200 mt-1 whitespace-nowrap">
                        [{field.getName()}]
                      </div>
                    </div>
                  </Table.Th>
                )
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sampleData!.map((row, index) => {

              return (
                <Table.Tr key={`body_${index + 1}`}>
                  {fields.map((field, index) => {

                    if (field.getName() === 'id') {
                      return (
                        <Table.Td align="center" key={`body_${field.getName()}_${index + 1}`} 
                          className="border border-gray-200 py-3 px-4 whitespace-nowrap">
                          <div className='flex items-center justify-center gap-1'>
                            <span className="text-sm text-gray-600 whitespace-nowrap">{`ID 값`}</span>
                            <Tooltip zIndex={10000} label='값이 있으면 UPDATE, 없으면 INSERT'>
                              <IconHelpCircle className='h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help' />
                            </Tooltip>
                          </div>
                        </Table.Td>
                      )
                    }

                    let value = '';
                    for (const data of row) {
                      if (data.name === field.getName()) {
                        value = data.value;
                        break;
                      }
                    }
                    return (
                      <Table.Td align="center" key={`body_${field.getName()}_${index + 1}`} 
                        className="border border-gray-200 py-3 px-4 text-sm text-gray-700 whitespace-nowrap">
                        {value}
                      </Table.Td>
                    )
                  })}
                </Table.Tr>
              )
            })}
          </Table.Tbody>
          </Table>
        </SafePerfectScrollbar>
      </div>
    </div>

  );

}

export default DataImportSample;

interface SampleDataButtonProps {
  processing?: boolean;
  exportKey: number;
  setProcessing?: (processing: boolean) => void;
  setExportKey: (exportKey: number) => void;
  fileName?: string;
  data?: SampleDataItem[][];
  fields: DataField[];
}

const SampleDataButton = (props: SampleDataButtonProps) => {

  const setProcessing = props.setProcessing ?? function (processing: boolean) {
    console.debug('do nothing with processing value: ', processing);
  }

  if (props.data === undefined) {
    return <></>;
  }

  const sampleData = props.data.map((row) => {
    return row.filter((item) => props.fields.find((field) => field.getName() === item.name));
  });

  console.log('sampleData: ', sampleData);

  return (
    <>
      {props.processing && (
        <Modal
          size={"lg"}
          opened={props.processing}
          closeOnClickOutside={false}
          zIndex={10000}
          onClose={() => {
            setProcessing(false);
          }}>
          <DataExportProcessor 
            fields={props.fields}
            exportFileName={props.fileName}
            key={'data_export_import_data' + props.exportKey}
            process={props.processing}
            data={sampleData}
            onProcessed={() => {
              props.setExportKey(Date.now());
              setProcessing(false);
            }} 
          />
        </Modal>
      )}
      {!props.processing && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          onClick={() => { setProcessing(true); }}
        >
          <IconFile className="h-4 w-4" />
          샘플 파일 다운로드
        </button>
      )}
    </>
  );

}
