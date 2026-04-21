'use client';

import {
  createFieldMap,
  DataColumn,
  DataField,
  DataRow,
  DataRowSet,
  DataTransferResult,
  ImportTransferConfig,
} from '../transfer/Type';
import { ReactNode, useState } from 'react';
import { getTranslation } from '../utils/i18n';
import { isTrue } from '../utils/BooleanUtil';
import { isBlank, subStringBetween } from '../utils/StringUtil';
import { isEmpty } from '../utils';
import * as XLSX from 'xlsx-js-style';
import { getAccessableAssetUrl, getExternalApiDataWithError } from '../misc';
import DataImportSample from '../transfer/DataImportSample';
import { Modal } from '../ui';
import { DataImportProcessor } from '../transfer/DataImportProcessor';
import { FileFieldValue, FileUploadInput } from '../ui';

interface ImporterProps {
  config?: ImportTransferConfig;
  sampleFileName: string;
  onClose: (result: boolean) => void; // 그냥 창을 닫았을 때
}

export const DataImporter = (props: ImporterProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<DataRowSet>([]);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const [importErrorView, setImportErrorView] = useState<ReactNode>(<></>);
  const [importResult, setImportResult] = useState<DataTransferResult>();

  const { t } = getTranslation();

  const resultView: boolean =
    isTrue(success) && isBlank(errorMessage) && isBlank(importError) && importResult !== undefined;
  const errorView: boolean = !isTrue(success) && (!isBlank(errorMessage) || !isBlank(importError));
  const preview: boolean = !isTrue(success) && isBlank(errorMessage) && isBlank(importError);

  function reset() {
    setData([]);
    setSuccess(false);
    setErrorMessage(undefined);
    setImportError(undefined);
    setImportResult(undefined);
  }

  const fields = props.config?.fields ?? [];
  const allowUpdate = props.config?.mode?.update !== false;
  const addedImportFields = props.config?.addedFields;
  const overrideFormData: ((formData: DataRowSet) => Promise<DataRowSet>) | undefined =
    props.config?.overrideFormData;
  const url = props.config!.url!;
  const overrideParseResult = props.config?.overrideParseResult;
  const description = props.config?.description ?? '';
  const sampleData = props.config?.sampleData ?? [];

  function onFileUpload(fileValue: FileFieldValue) {
    const currentFiles = fileValue.getCurrentFileList();
    if (currentFiles.length === 0) return;

    const file = currentFiles[0];
    if (!file) return;
    let result = [];

    if (file instanceof File) {
      // 사용자가 직접 업로드한 파일
      const reader = new FileReader();
      reset();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result;
          const wb = XLSX.read(buffer, { type: 'array' });
          const wsname = wb.SheetNames[0] || '';
          const ws = wb.Sheets[wsname] || {};
          result = XLSX.utils.sheet_to_json(ws, { header: 1 });
          /*
          fields 정보와 비교해 불필요한 필드는 제거한다.
           */
          const cells: number[] = [];
          const header: any = {};

          const fieldMap: Map<string, DataField> = createFieldMap(...fields);

          if (isEmpty(result)) {
            setErrorMessage('업로드 대상 필드가 일치하지 않습니다.');
            return;
          } else {
            const row: any = result[0];

            row.findIndex((cell: string, excelColIndex: number) => {
              // cell 내용이 이름\n[필드이름] 형태라면
              if (cell.includes('[') && cell.includes(']')) {
                const fieldName = subStringBetween(cell, '[', ']')
                  .trim()
                  .replace(/\n/g, '')
                  .replace(' ', '');
                cell = fieldName;
              }

              if (fieldMap.has(cell)) {
                cells.push(excelColIndex);
                header[cell] = fieldMap.get(cell)?.getLabel();
              }
            });
          }

          if (cells.length === 0) {
            setErrorMessage('업로드 대상 필드가 일치하지 않습니다.');
            return;
          } else {
            const sheetData: DataRowSet = [];
            sheetData.push(header);
            result.map(async (row: any, index: number) => {
              if (index > 0) {
                const newRow: DataRow = [];
                cells.forEach(async (excelColIndex: number, arrayIndex: number) => {
                  const field = fields[arrayIndex];

                  if (field) {
                    const fieldName: string = field.getName();
                    newRow.push({
                      name: fieldName,
                      value: await field.getValueOnImport(row[excelColIndex]),
                    });
                  }
                });
                sheetData.push(newRow);
              }
            });

            if (sheetData.length > 1) {
              // append header and body
              setData(sheetData);
            } else {
              setErrorMessage('데이터가 존재하지 않습니다.');
              return;
            }
          }

          setOpen(true);
        } catch (err) {
          setErrorMessage('엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식(xlsx)을 확인하세요.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.url) {
      // 서버에 이미 업로드된 파일 (FileInfo)
      reset();
      const fileUrl = getAccessableAssetUrl(file.url);
      fetch(fileUrl)
        .then((response) => {
          return response.arrayBuffer();
        })
        .then((buffer) => {
          try {
            const wb = XLSX.read(buffer, { type: 'array' });
            const wsname = wb.SheetNames[0] || '';
            const ws = wb.Sheets[wsname] || {};
            result = XLSX.utils.sheet_to_json(ws, { header: 1 });

            /*
            fields 정보와 비교해 불필요한 필드는 제거한다.
             */
            const cells: number[] = [];
            const header: any = {};

            const fieldMap: Map<string, DataField> = createFieldMap(...fields);

            if (isEmpty(result)) {
              setErrorMessage('업로드 대상 필드가 일치하지 않습니다.');
              return;
            } else {
              const row: any = result[0];

              row.findIndex((cell: string, excelColIndex: number) => {
                // cell 내용이 이름\n[필드이름] 형태라면
                if (cell.includes('[') && cell.includes(']')) {
                  const fieldName = subStringBetween(cell, '[', ']')
                    .trim()
                    .replace(/\n/g, '')
                    .replace(' ', '');
                  cell = fieldName;
                }

                if (fieldMap.has(cell)) {
                  cells.push(excelColIndex);
                  header[cell] = fieldMap.get(cell)?.getLabel();
                }
              });
            }

            if (cells.length === 0) {
              setErrorMessage('업로드 대상 필드가 일치하지 않습니다.');
              return;
            } else {
              const sheetData: DataRowSet = [];
              sheetData.push(header);
              result.map(async (row: any, index: number) => {
                if (index > 0) {
                  const newRow: DataRow = [];
                  cells.forEach(async (excelColIndex: number, arrayIndex: number) => {
                    const field = fields[arrayIndex];

                    if (field) {
                      const fieldName: string = field.getName();
                      newRow.push({
                        name: fieldName,
                        value: await field.getValueOnImport(row[excelColIndex]),
                      });
                    }
                  });
                  sheetData.push(newRow);
                }
              });

              if (sheetData.length > 1) {
                // append header and body
                setData(sheetData);
              } else {
                setErrorMessage('데이터가 존재하지 않습니다.');
                return;
              }
            }

            setOpen(true);
          } catch (err) {
            setErrorMessage(
              '엑셀 파일을 읽는 중 오류가 발생했습니다. 파일 형식(xlsx)을 확인하세요.',
            );
          }
        })
        .catch((error) => {
          setErrorMessage('파일을 읽는 중 오류가 발생했습니다.');
        });
    }
  }

  async function onSubmit() {
    try {
      // data 의 첫번째 row 는 헤더필드 이므로 제거해야 한다.
      const fileData: DataRow[] = isEmpty(data) ? [] : data.slice(1);
      let formData: DataRowSet = [];

      // formData 의 각 행, 각 셀의 데이터를 map 으로 변환해 전송한다.
      if (fileData.length > 0) {
        try {
          const rows: DataRow[] = await Promise.all(
            fileData.map(async (row: DataRow) => {
              try {
                let columns: DataColumn[] = [...row];

                if (addedImportFields !== undefined) {
                  const addedColumns = await addedImportFields(columns);
                  columns = [...columns, ...addedColumns];
                }

                return columns;
              } catch (error) {
                console.error('Error processing row:', error);
                throw error;
              }
            }),
          );

          formData = rows;
        } catch (error) {
          console.error('Error processing rows:', error);
          throw error;
        }
      }

      if (overrideFormData !== undefined) {
        try {
          formData = await overrideFormData(formData);
        } catch (error) {
          console.error('Error in overrideFormData:', error);
          throw error;
        }
      }

      // server 측 DTO 는 list 타입의 data 필드를 가지고 있어야 한다.
      try {
        // 서버에 전송하기 위한 데이터 형식으로 변환한다.
        const importData: ImportSubmitData = {
          rows: [],
        };

        const rows: Map<string, DataColumn>[] = [];

        formData.forEach((row: DataRow) => {
          const rowMap: Map<string, DataColumn> = new Map();
          row.forEach((column: DataColumn) => {
            rowMap.set(column.name, { name: column.name, value: column.value });
          });
          rows.push(rowMap);
          importData.rows.push({
            properties: rowMap,
          });
        });

        const response = await getExternalApiDataWithError({
          url: url,
          formData: importData,
        });

        if (overrideParseResult) {
          const overrideParseResultResult = overrideParseResult(formData, response.data);
          setImportResult(overrideParseResultResult.result);
          setSuccess(overrideParseResultResult.success);
          setImportError(overrideParseResultResult.error ?? '');
          setImportErrorView(overrideParseResultResult.errorView ?? <></>);
        } else {
          if (response.data) {
            const result: DataTransferResult = response.data;
            setImportResult(result);
            setSuccess(true);
          } else {
            throw new Error(response.error);
          }
        }
      } catch (error: unknown) {
        console.error('Error in API call:', error);
        setSuccess(false);
        const message = error instanceof Error ? error.message : '업로드에 실패하였습니다.';
        setImportError(message);
      }
    } catch (error: unknown) {
      console.error('Error in onSubmit:', error);
      setSuccess(false);
      const message = error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.';
      setErrorMessage(message);
    }
  }

  let resultModalTitle: string = '';

  if (resultView) {
    resultModalTitle = t('form.list.dataTransfer.tab.import.messages.success');
  } else {
    if (errorView) {
      resultModalTitle = t('form.list.dataTransfer.tab.import.messages.error');
    } else if (preview) {
      resultModalTitle = t('form.list.dataTransfer.tab.import.messages.preview');
    }
  }

  return (
    <>
      <Modal
        opened={true}
        size={'5xl'}
        title={t('form.list.dataTransfer.tab.import.title')}
        onClose={() => {
          props.onClose(false);
        }}
      >
        <div className="rcm-importer-body">
          <DataImportSample
            fields={fields}
            sampleData={sampleData}
            sampleFileName={props.sampleFileName}
            allowUpdate={allowUpdate}
          />
          <div className="rcm-importer-section">
            <h3 className="rcm-text" data-weight="semibold">
              {t('form.list.dataTransfer.tab.import.file.label') || '업로드할 파일 선택'}
            </h3>
            <FileUploadInput
              name={'file'}
              value={undefined}
              onChange={onFileUpload}
              config={{
                maxCount: 1,
                fileTypes: [
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-excel',
                ],
                extensions: ['xlsx', 'xls'],
              }}
            />
          </div>
          {description && (
            <div
              className="rcm-importer-description"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              {description}
            </div>
          )}
        </div>
        {open && (
          <Modal
            size={'5xl'}
            title={resultModalTitle}
            zIndex={11000}
            opened={open}
            closeOnClickOutside={false}
            closeOnEscape={false}
            onClose={() => {
              cancelImport();
            }}
          >
            <DataImportProcessor
              fields={fields}
              data={data}
              preview={preview}
              errorMessage={errorMessage}
              importError={importError}
              importErrorView={importErrorView}
              viewError={errorView}
              importResult={importResult}
              cancelImport={cancelImport}
              resultView={resultView}
              onImportSuccess={onImportSuccess}
              onSubmit={onSubmit}
            />
          </Modal>
        )}
      </Modal>
    </>
  );

  function cancelImport() {
    setOpen(false);
    setData([]);
  }

  function onImportSuccess() {
    setOpen(false);
    props.onClose(true);
  }
};

interface ImportSubmitData {
  rows: ImportRow[];
}

interface ImportRow {
  properties: Map<string, DataColumn>;
}
