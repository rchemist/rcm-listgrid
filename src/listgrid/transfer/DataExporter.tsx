'use client';

import { DataField, ExportTransferConfig } from '../transfer/Type';
import { Modal } from '../ui';
import { getTranslation } from '../utils/i18n';
import { ReactNode, useEffect, useState } from 'react';
import { SimpleGrid } from '../ui';
import { SearchForm } from '../form/SearchForm';
import { DataExportProcessor } from '../transfer/DataExportProcessor';
import { Button } from '../ui';
import { ExcelPasswordField } from '../transfer/ExcelPasswordField';

interface ExporterProps {
  config?: ExportTransferConfig;
  fileName: string;
  searchForm: SearchForm;
  onClose: () => void;
}

export const DataExporter = ({ config, searchForm, fileName, onClose }: ExporterProps) => {
  const { t } = getTranslation();
  const fields = config?.fields ?? [];
  const [dataFields, setDataFields] = useState<DataField[]>([...fields]);
  const [ableToExport, setAbleToExport] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [exportKey, setExportKey] = useState(Date.now());
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setMounted(true);
  }, []);

  if (config === undefined || !mounted) return null;

  const title = t('form.list.dataTransfer.tab.export.title') ?? '다운로드';

  const instruction = t('form.list.dataTransfer.tab.export.message');

  const description = config?.description ?? '';
  const url = config.url!;

  return (
    <>
      <Modal
        size={'5xl'}
        title={title}
        animation={'none'}
        closeOnClickOutside={false}
        closeOnEscape={false}
        opened={true}
        onClose={() => {
          onClose();
        }}
      >
        <div className="rcm-dialog-body">
          <div className="rcm-stack">
            <div
              className="rcm-notice"
              data-tone="info"
              style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}
            >
              <label className="rcm-text-sm rcm-text-info rcm-text-emphasis">{instruction}</label>
            </div>
            <div className="rcm-panel">
              <h3 className="rcm-heading-sm">다운로드할 필드 선택</h3>
              <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                {(function () {
                  const forms: ReactNode[] = [];
                  fields.forEach((field) => {
                    const fieldName = field.getName();
                    if (fieldName === 'id') {
                      return;
                    }
                    forms.push(
                      <div className="rcm-checkbox-row" key={`fields_${fieldName}`}>
                        <input
                          type="checkbox"
                          key={fieldName}
                          id={fieldName}
                          name={fieldName}
                          defaultChecked={dataFields.some((item) => item.equals(field))}
                          value={field.getName()}
                          onChange={(event) => {
                            handleTargetFieldChange(field, event);
                          }}
                        />
                        <label htmlFor={`${fieldName}`} className="rcm-checkbox-label">
                          {field.getLabel()}
                        </label>
                      </div>,
                    );
                  });
                  return forms;
                })()}
              </SimpleGrid>
            </div>
          </div>
          <ExcelPasswordField
            password={password}
            onPasswordChange={setPassword}
            error={error}
            onErrorChange={setError}
          />
          {description && (
            <div className="rcm-notice" data-tone="warning">
              <div className="rcm-text-sm rcm-text-warning">{description}</div>
            </div>
          )}

          <div className="rcm-action-bar">
            <Button
              variant="filled"
              disabled={!ableToExport}
              className="rcm-button"
              data-variant="primary"
              onClick={() => {
                handleExport();
              }}
            >
              {t('form.list.dataTransfer.tab.export.button.download')}
            </Button>
          </div>
        </div>
      </Modal>
      {processing && (
        <Modal
          size={'lg'}
          title={`${title}`}
          opened={processing}
          closeOnClickOutside={false}
          closeOnEscape={false}
          onClose={() => {
            setProcessing(false);
          }}
        >
          <DataExportProcessor
            url={url}
            fields={dataFields}
            searchForm={searchForm}
            exportFileName={fileName}
            addedFields={config?.addedFields}
            overrideFormData={config?.overrideFormData}
            key={'data_export_' + exportKey}
            process={processing}
            password={password}
            onProcessed={() => {
              setExportKey(Date.now());
              setProcessing(false);
            }}
          ></DataExportProcessor>
        </Modal>
      )}
    </>
  );

  function handleExport() {
    setError('');
    setProcessing(true);
  }

  function handleTargetFieldChange(
    targetField: DataField,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const isChecked = event.target.checked;
    const fieldExists = dataFields.some((item) => item.equals(targetField));

    if (isChecked && !fieldExists) {
      addExportField(targetField);
      updateAbleToExport(true);
    } else if (!isChecked) {
      removeExportField(targetField);
      updateAbleToExportIfEmpty();
    }
  }

  function addExportField(targetField: DataField) {
    const newExportFields = [...dataFields, targetField];
    setDataFields(newExportFields);
  }

  function removeExportField(targetField: DataField) {
    const newExportFields = dataFields.filter((item) => !item.equals(targetField));
    setDataFields(newExportFields);
  }

  function updateAbleToExport(value: boolean) {
    if (!ableToExport) {
      setAbleToExport(value);
    }
  }

  function updateAbleToExportIfEmpty() {
    if (dataFields.length === 1) {
      setAbleToExport(false);
    }
  }
};
