'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import {DataField, ExportTransferConfig} from '../transfer/Type';
import {Modal} from "@gjcu/ui/modals/Modal";
import {getTranslation} from "../utils/i18n";
import {ReactNode, useEffect, useState} from "react";
import {SimpleGrid} from "@gjcu/ui/elements/layout/SimpleGrid";
import {SearchForm} from "../form/SearchForm";
import {DataExportProcessor} from '../transfer/DataExportProcessor';
import {Button} from "@gjcu/ui/elements/buttons/Button";
import {ExcelPasswordField} from '../transfer/ExcelPasswordField';

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

  if (config === undefined || !mounted)
    return null;

  const title = t('form.list.dataTransfer.tab.export.title') ?? '다운로드';

  const instruction = t('form.list.dataTransfer.tab.export.message');

  const description = config?.description ?? '';
  const url = config.url!;


  return <>
    <Modal size={'5xl'}
      title={title}
      animation={'none'}
      closeOnClickOutside={false}
      closeOnEscape={false}
      opened={true}
      onClose={() => { onClose() }}>
      <div className={'p-6 w-full space-y-6'}>
        <div className={'space-y-4'}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
            <label className={'text-sm text-blue-800 font-medium'}>
              {instruction}
            </label>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">다운로드할 필드 선택</h3>
            <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4, lg: 5 }}
              spacing="md">
            {(function () {
              const forms: ReactNode[] = [];
              fields.forEach((field) => {
                const fieldName = field.getName();
                if (fieldName === 'id') {
                  return;
                }
                forms.push(
                  <div className={'flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors'} key={`fields_${fieldName}`}>
                    <input type={'checkbox'}
                      className={'form-checkbox text-indigo-600 focus:ring-indigo-500'}
                      key={fieldName}
                      id={fieldName}
                      name={fieldName}
                      defaultChecked={dataFields.some((item) => item.equals(field))} value={field.getName()}
                      onChange={(event) => {
                        handleTargetFieldChange(field, event)
                      }} />
                    <label htmlFor={`${fieldName}`} className="mb-0 cursor-pointer text-sm text-gray-700 select-none">{field.getLabel()}</label>
                  </div>
                );
              });
              return forms;
            }())}
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-800">{description}</div>
          </div>
        )}

        <div className={'w-full flex items-center justify-center pt-6'}>
          <Button 
            variant="filled" 
            disabled={!ableToExport} 
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            onClick={() => {
              handleExport();
            }}>
            {t('form.list.dataTransfer.tab.export.button.download')}
          </Button>
        </div>
      </div>
    </Modal>
    {processing && <Modal size={'lg'}
      title={`${title}`}
      opened={processing} closeOnClickOutside={false} closeOnEscape={false} onClose={() => { setProcessing(false) }}>
      <DataExportProcessor url={url} fields={dataFields}
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
        }}></DataExportProcessor>
    </Modal>}
  </>;


  function handleExport() {
    setError('');
    setProcessing(true);
  }

  function handleTargetFieldChange(targetField: DataField, event: React.ChangeEvent<HTMLInputElement>) {
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
}
