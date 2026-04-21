'use client';

import {
  DataField,
  DataRow,
  DataRowSet,
  getExportFileName,
  SampleDataItem,
} from '../transfer/Type';
import { SearchForm } from '../form/SearchForm';
import { useEffect, useState } from 'react';
import { getTranslation } from '../utils/i18n';
import DataExportService from '../transfer/DataExportService';
import { isBlank } from '../utils/StringUtil';
import { LinearIndicator } from '../ui';
import { Button } from '../ui';
import ExcelDownload from '../transfer/Provider/ExcelProvider';
import { LoadingOverlay } from '../ui';

interface ExportProcessorProps {
  process: boolean;
  fields: DataField[];
  url?: string | undefined;
  onProcessed: () => void;
  maxCount?: number | undefined;
  countPerPage?: number | undefined;
  searchForm?: SearchForm | undefined;
  exportFileName?: string | undefined;
  data?: SampleDataItem[][] | undefined;
  password?: string | undefined;
  addedFields?: ((row: DataRow) => Promise<DataRow>) | undefined;

  // 엑셀 업로드 시 폼 데이터 조작
  overrideFormData?: ((formData: DataRowSet) => Promise<DataRowSet>) | undefined;
}

export const DataExportProcessor = ({
  process,
  url,
  fields,
  onProcessed,
  maxCount,
  countPerPage,
  searchForm,
  exportFileName,
  data: initialData,
  password,
  addedFields,
  overrideFormData,
}: ExportProcessorProps) => {
  const restrictCount: number = maxCount || 100;

  const perPageCount: number = countPerPage || 100;

  const maxLimitCount: number = restrictCount * perPageCount;

  const editorFields: string[] = getEditorFields();

  const [exportable, setExportable] = useState(true);

  const [failedCount, setFailedCount] = useState(0);

  const [error, setError] = useState<string>('');

  const [data, setData] = useState<DataRowSet>();

  const { t } = getTranslation();

  const [exportProgress, setExportProgress] = useState(0);

  const fileName = getExportFileName(exportFileName, t);

  const [onDownload, setOnDownload] = useState(false);

  const service = new DataExportService({
    searchForm: searchForm?.clone() ?? SearchForm.create(),
    url: url,
    fields: fields,
    restrictCount: restrictCount,
    pagePerCount: perPageCount,
    setExportable: setExportable,
    setFailedCount: setFailedCount,
    setProgress: setExportProgress,
    setData: setData,
    data: initialData,
    setError: setError,
    editorFields: editorFields,
    addedFields: addedFields,
  });

  useEffect(() => {
    service.process();
  }, []);

  if (!process) {
    return <></>;
  }

  return (
    <>
      <h1 className={'text-xl mb-2'}>
        {(function () {
          if (exportProgress < 100) {
            return t('form.list.dataTransfer.tab.export.processing');
          } else if (exportProgress >= 100) {
            return t('form.list.dataTransfer.tab.export.processed');
          }
          return t('form.list.dataTransfer.tab.export.processing');
        })()}
      </h1>

      {
        <div>
          {exportable && (
            <>
              {isBlank(error) && (
                <>
                  {exportProgress < 100 && (
                    <div className={'py-1 mb-3'}>
                      <div className={'text-primary'}>
                        {t('form.list.dataTransfer.tab.export.onProcessing')}
                      </div>
                      <LinearIndicator
                        value={exportProgress}
                        key={'progress_indicator_' + exportProgress}
                      />
                    </div>
                  )}
                  {exportProgress >= 100 && (
                    <div className={'py-1 mb-3'}>
                      <div className={'text-success text-sm'}>
                        {t('form.list.dataTransfer.tab.export.fileCreated')}
                      </div>
                    </div>
                  )}
                </>
              )}
              {!isBlank(error) && (
                <div className={'py-1 mb-3'}>
                  <span className={'text-danger'}>{t(error)}</span>
                </div>
              )}
              {onDownload && (
                <div className={'relative'}>
                  <LoadingOverlay visible={true} />
                  <div className={'w-full h-[100px]'}></div>
                </div>
              )}
              {!onDownload && (
                <div className={'flex items-center justify-center space-x-2'}>
                  <Button
                    variant={'filled'}
                    onClick={() => {
                      setOnDownload(true);
                      try {
                        setTimeout(() => {
                          (async () => {
                            let fileData: DataRowSet = [...(data ?? [])];

                            if (overrideFormData !== undefined && data !== undefined) {
                              const overrideFormDataResult = await overrideFormData(data);
                              fileData = Array.isArray(overrideFormDataResult)
                                ? overrideFormDataResult
                                : [overrideFormDataResult];
                            }

                            await ExcelDownload({
                              data: fileData,
                              fileName: fileName,
                              password: password,
                              fields: fields,
                              logOptions: {
                                condition: {
                                  exportUrl: url,
                                  fields: fields.map((f) => f.getName()),
                                },
                              },
                            });
                            onProcessed();
                          })();
                        }, 100);
                      } catch (e) {
                        setOnDownload(false);
                        setError(t('form.list.dataTransfer.tab.export.error.download'));
                      }
                    }}
                    disabled={exportProgress < 100 || !isBlank(error)}
                    style={{ marginRight: 1 }}
                  >
                    {t('form.list.dataTransfer.tab.export.button.download')}
                  </Button>
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setExportProgress(0);
                      onProcessed();
                    }}
                  >
                    {t('form.list.dataTransfer.tab.export.button.cancel')}
                  </Button>
                </div>
              )}
            </>
          )}
          {!exportable && (
            <>
              <div>
                <h3>{t('form.list.dataTransfer.tab.export.error.limit.retry')}</h3>
                <div>
                  {t('form.list.dataTransfer.tab.export.error.limit.cause')}: {failedCount}
                </div>
                <div>
                  {t('form.list.dataTransfer.tab.export.error.limit.warning')}: {maxLimitCount}
                </div>
              </div>
              <div className={'text-center'}>
                <Button
                  variant={'outline'}
                  color={'inherit'}
                  onClick={() => {
                    onProcessed();
                  }}
                >
                  {t('form.list.dataTransfer.tab.export.button.close')}
                </Button>
              </div>
            </>
          )}
        </div>
      }
    </>
  );

  function getEditorFields() {
    const editorFields: string[] = [];
    fields.forEach((field) => {
      if (field.getType() === 'html' || field.getType() === 'markdown') {
        editorFields.push(field.getName());
      }
    });
    return editorFields;
  }
};
