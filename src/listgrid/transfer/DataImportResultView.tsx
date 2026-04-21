import { FC, ReactNode } from 'react';
import { Alert } from '../ui';
import { Table } from '../ui';
import { Box } from '../ui';
import { Flex } from '../ui';
import { Paper } from '../ui';
import { DataField, DataTransferResult } from '../transfer/Type';
import { getTranslation } from '../utils/i18n';
import { isEmpty, isPositive } from '../misc';

export interface DataImportResultViewProps {
  result: DataTransferResult;
  fields: DataField[];
}

export const DataImportResultView: FC<DataImportResultViewProps> = ({ result, fields }) => {
  const { t } = getTranslation();

  const successResult = getImportSuccessResult(result);

  const message = getImportSuccessMessage(successResult);

  const titleColor = successResult === 'FAILED' ? 'red' : 'teal';

  const resultTableColor = successResult === 'FAILED' ? 'red' : 'teal';

  return (
    <>
      <Alert color={titleColor} message={message}>
        <p
          className={`text-sm font-bold mb-2 ${titleColor === 'red' ? 'text-red-500' : 'text-teal-500'}`}
        >
          {t('form.list.dataTransfer.tab.import.result.title')}
        </p>
        <Table className="mb-4 rounded-md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                className={`text-center w-40 border-l border-r border-b border-${resultTableColor}-500/20 text-sm font-bold bg-${resultTableColor}-400 text-white`}
              >
                구분
              </Table.Th>
              <Table.Th
                className={`text-center border-r border-b border-${resultTableColor}-500/20 text-sm font-bold bg-${resultTableColor}-400 text-white`}
              >
                결과
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td
                className={`text-center border-l border-r border-b border-${resultTableColor}-500/20`}
              >
                {t('form.list.dataTransfer.tab.import.result.requested')}
              </Table.Td>
              <Table.Td
                className={`text-center border-r border-b border-${resultTableColor}-500/20`}
              >
                {result.requested}
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td
                className={`text-center border-l border-r border-b border-${resultTableColor}-500/20`}
              >
                {t('form.list.dataTransfer.tab.import.result.created')}
              </Table.Td>
              <Table.Td
                className={`text-center border-r border-b border-${resultTableColor}-500/20`}
              >
                {result.created}
              </Table.Td>
            </Table.Tr>
            {isPositive(result.updated) && (
              <Table.Tr>
                <Table.Td
                  className={`text-center border-l border-r border-b border-${resultTableColor}-500/20`}
                >
                  {t('form.list.dataTransfer.tab.import.result.updated')}
                </Table.Td>
                <Table.Td
                  className={`text-center border-r border-b border-${resultTableColor}-500/20`}
                >
                  {result.updated}
                </Table.Td>
              </Table.Tr>
            )}
            {isPositive(result.failed) && (
              <Table.Tr>
                <Table.Td
                  className={`text-center border-l border-r border-b border-${resultTableColor}-500/20`}
                >
                  {t('form.list.dataTransfer.tab.import.result.failed')}
                </Table.Td>
                <Table.Td
                  className={`text-center border-r border-b border-${resultTableColor}-500/20`}
                >
                  {result.failed}
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        {result.errors && !isEmpty(result.errors) && (
          <Box style={{ paddingTop: 10 }}>
            <p className="text-sm font-bold text-red-500">
              {t('form.list.dataTransfer.tab.import.result.error')}
            </p>
            {result.errors && result.errors.length > 0 && (
              <Table className="mt-2 rounded-md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="text-center w-20 border-l border-r border-b border-red-500/20 text-sm font-bold bg-red-400 text-white">
                      행
                    </Table.Th>
                    <Table.Th className="text-center w-40 border-r border-b border-red-500/20 text-sm font-bold bg-red-400 text-white">
                      필드
                    </Table.Th>
                    <Table.Th className="text-center border-b border-r border-red-500/20 text-sm font-bold bg-red-400 text-white">
                      에러 메시지
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.errors.map((value, errorIndex) => (
                    <Table.Tr key={`error-row-${errorIndex}`}>
                      <Table.Td className="text-center border-l border-r border-b border-red-500/20">
                        {value.row || '-'}
                      </Table.Td>
                      <Table.Td className="text-center border-r border-b border-red-500/20">
                        {value.field ? getFieldLabel(value.field) : '-'}
                      </Table.Td>
                      <Table.Td className="text-sm font-normal border-r border-b border-red-500/20">
                        {value.message}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Box>
        )}
      </Alert>
    </>
  );

  function getFieldLabel(name: string) {
    const field = fields.find((field) => field.getName() === name);
    if (field) {
      return field.getLabel();
    }
    return '';
  }
};

export interface ImportErrorViewProps {
  importError?: string | undefined;
  errorMessage?: string | undefined;
  importErrorView?: ReactNode | undefined;
}

export const ImportErrorView: FC<ImportErrorViewProps> = (props) => {
  const { t } = getTranslation();
  const importError = props.importError;
  const parseError = props.errorMessage;
  const importErrorView = props.importErrorView;

  return (
    <Box style={{ width: `100%` }}>
      {importError && (
        <Flex align={'center'} justify={'center'}>
          <Box style={{ paddingTop: 5, paddingBottom: 5, width: `100%` }}>
            <Alert color={'red'} message={importError}>
              {t('form.list.dataTransfer.tab.import.messages.retry')}
            </Alert>
          </Box>
        </Flex>
      )}
      {parseError && (
        <Paper style={{ padding: 2, width: '100%' }}>
          <Alert color={'red'} message={parseError}>
            {t('form.list.dataTransfer.tab.import.messages.retry')}
          </Alert>
        </Paper>
      )}
      {importErrorView}
    </Box>
  );
};

type ImportSuccessResult = 'SUCCESS' | 'FAILED' | 'PARTIAL_SUCCESS' | 'NOTHING';

function getImportSuccessResult(result: DataTransferResult): ImportSuccessResult {
  const created = getNumber(result.created);
  const updated = getNumber(result.updated);
  const failed = getNumber(result.failed);

  if (created > 0 || updated > 0) {
    if (failed > 0) {
      return 'PARTIAL_SUCCESS';
    }
    return 'SUCCESS';
  }

  if (failed > 0) {
    return 'FAILED';
  }

  return 'NOTHING';
}

function getNumber(value: number | undefined): number {
  if (value === undefined) {
    return 0;
  }
  return value;
}

function getImportSuccessMessage(result: ImportSuccessResult): string {
  const { t } = getTranslation();
  switch (result) {
    case 'SUCCESS':
      return t('form.list.dataTransfer.tab.import.messages.success');
    case 'FAILED':
      return t('form.list.dataTransfer.tab.import.messages.success.failed');
    case 'PARTIAL_SUCCESS':
      return t('form.list.dataTransfer.tab.import.messages.success.partial');
    case 'NOTHING':
      return t('form.list.dataTransfer.tab.import.messages.success.nothing');
  }
}
