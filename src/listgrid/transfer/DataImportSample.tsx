'use client';

import { FC, useEffect, useState } from 'react';
import { Table } from '../ui';
import { SafePerfectScrollbar } from '../ui';
import { Modal } from '../ui';
import { IconFile, IconHelpCircle } from '@tabler/icons-react';
import clsx from 'clsx';
import { DataField, SampleDataItem } from '../transfer/Type';
import { DataExportProcessor } from '../transfer/DataExportProcessor';
import { getTranslation } from '../utils/i18n';
import { Tooltip } from '../ui';

export interface DataImportSampleProps {
  sampleFileName?: string;
  fields: DataField[];
  sampleData?: SampleDataItem[][];
  allowUpdate?: boolean;
}

export const DataImportSample: FC<DataImportSampleProps> = ({
  sampleFileName: exportFileName,
  sampleData: initialData,
  allowUpdate = true,
  ...props
}) => {
  const fields: DataField[] = props.fields.filter((field) => {
    return initialData![0]!.find((item) => item.name === field.getName()) !== undefined;
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
        const row = initialData[0]!;
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
    <div className="rcm-import-sample">
      <div className="rcm-import-sample-guide">
        <p className="rcm-text" data-size="sm" data-tone="muted">
          {t('form.list.dataTransfer.tab.import.messages.guide')}
        </p>
        <SampleDataButton
          exportKey={exportKey}
          setExportKey={setExportKey}
          setProcessing={setProcessing}
          processing={processing}
          data={sampleData}
          fileName={exportFileName}
          fields={fields}
        />
      </div>
      {hasRequired && (
        <div className="rcm-import-sample-required-notice">
          <span className="rcm-import-sample-required-star">*</span>
          <span className="rcm-import-sample-required-text">
            표시가 있는 필드는 필수 항목입니다. 필수 항목을 입력하지 않으면 업로드 되지 않습니다.
          </span>
        </div>
      )}
      <div className="rcm-import-sample-table-wrap">
        <SafePerfectScrollbar style={{ minWidth: '100%' }}>
          <Table style={{ minWidth: 650 }} aria-label="simple table">
            <Table.Thead>
              <Table.Tr>
                {fields.map((field, index) => {
                  return (
                    <Table.Th
                      key={`header_${field.getName()}_${index + 1}`}
                      className={clsx(
                        'rcm-import-sample-th',
                        field.isRequired() && 'rcm-import-sample-th-required',
                      )}
                    >
                      <div className="rcm-import-sample-th-inner">
                        <div className="rcm-import-sample-th-label-row">
                          {field.isRequired() && (
                            <span className="rcm-import-sample-th-star">*</span>
                          )}
                          <span className="rcm-import-sample-th-label">{field.getLabel()}</span>
                        </div>
                        <div className="rcm-import-sample-th-name">[{field.getName()}]</div>
                      </div>
                    </Table.Th>
                  );
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
                          <Table.Td
                            align="center"
                            key={`body_${field.getName()}_${index + 1}`}
                            className="rcm-import-sample-td"
                          >
                            <div className="rcm-import-sample-td-id">
                              <span
                                className="rcm-text"
                                data-size="sm"
                                data-tone="muted"
                                style={{ whiteSpace: 'nowrap' }}
                              >{`ID 값`}</span>
                              <Tooltip zIndex={10000} label="값이 있으면 UPDATE, 없으면 INSERT">
                                <IconHelpCircle className="rcm-import-sample-td-id-help" />
                              </Tooltip>
                            </div>
                          </Table.Td>
                        );
                      }

                      let value = '';
                      for (const data of row) {
                        if (data.name === field.getName()) {
                          value = data.value;
                          break;
                        }
                      }
                      return (
                        <Table.Td
                          align="center"
                          key={`body_${field.getName()}_${index + 1}`}
                          className="rcm-import-sample-td rcm-import-sample-td-value"
                        >
                          {value}
                        </Table.Td>
                      );
                    })}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </SafePerfectScrollbar>
      </div>
    </div>
  );
};

export default DataImportSample;

interface SampleDataButtonProps {
  processing?: boolean | undefined;
  exportKey: number;
  setProcessing?: ((processing: boolean) => void) | undefined;
  setExportKey: (exportKey: number) => void;
  fileName?: string | undefined;
  data?: SampleDataItem[][] | undefined;
  fields: DataField[];
}

const SampleDataButton = (props: SampleDataButtonProps) => {
  const setProcessing =
    props.setProcessing ??
    function (_processing: boolean) {
      // no-op default
    };

  if (props.data === undefined) {
    return <></>;
  }

  const sampleData = props.data.map((row) => {
    return row.filter((item) => props.fields.find((field) => field.getName() === item.name));
  });

  return (
    <>
      {props.processing && (
        <Modal
          size={'lg'}
          opened={props.processing}
          closeOnClickOutside={false}
          zIndex={10000}
          onClose={() => {
            setProcessing(false);
          }}
        >
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
          className="rcm-button rcm-import-sample-download-btn"
          data-variant="primary"
          onClick={() => {
            setProcessing(true);
          }}
        >
          <IconFile className="rcm-m2o-action-icon" />
          샘플 파일 다운로드
        </button>
      )}
    </>
  );
};
