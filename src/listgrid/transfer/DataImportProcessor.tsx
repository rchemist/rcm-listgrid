'use client';

import { Table } from '../ui';
import { SafePerfectScrollbar } from '../ui';
import { Box } from '../ui';
import { Flex } from '../ui';
import { Grid } from '../ui';
import { Paper } from '../ui';
import { FC, ReactNode, useEffect, useState } from 'react';
// CSS module removed in Stage 8 (host app supplies styling)
const classes: Record<string, string> = {};
import { DataField, DataRow, DataTransferResult } from '../transfer/Type';
import { DataImportResultView, ImportErrorView } from '../transfer/DataImportResultView';
import { defaultString } from '../utils/StringUtil';
import { DataRowSet } from './Type';
import { isEmpty } from '../utils';

interface DataImportPreviewViewerProps {
  resultView: boolean;
  data: DataRowSet;
  fields: DataField[];
  onSubmit: () => void;
  cancelImport: () => void;
  onImportSuccess?: (() => void) | undefined;
  importResult?: DataTransferResult | undefined;
  preview: boolean;
  importError?: string | undefined;
  errorMessage?: string | undefined;
  viewError: boolean;
  importErrorView?: ReactNode | undefined;
}

export const DataImportProcessor = ({
  resultView,
  data,
  importResult,
  onSubmit,
  cancelImport,
  onImportSuccess,
  viewError,
  importErrorView,
  importError,
  errorMessage,
  preview,
  ...props
}: DataImportPreviewViewerProps) => {
  const [fields, setFields] = useState<DataField[]>([]);

  useEffect(() => {
    if (data && !isEmpty(data) && props.fields && !isEmpty(props.fields)) {
      const fields = props.fields.filter((field) => {
        // 첫줄은 헤더로 {id: '아이디', name: '이름', ...} 형식으로 데이터가 들어 온다.
        const header: any = data[0];
        return header[field.getName()] !== undefined;
      });
      setFields(fields);
    }
  }, [props.fields, data]);

  if (isEmpty(fields)) {
    return <></>;
  }

  return (
    <>
      <Box>
        {resultView && (
          <Box>
            <Box style={{ padding: `2rem` }}>
              <DataImportResultView result={importResult!} fields={fields} />
            </Box>
            <Flex align={'center'} style={{ width: '100%', paddingTop: 2 }} justify={'center'}>
              <button
                type="button"
                className="rcm-button"
                data-variant="outline"
                onClick={() => {
                  cancelImport();
                  onImportSuccess?.call(this);
                }}
              >
                확인
              </button>
            </Flex>
          </Box>
        )}
        {!resultView && (
          <Box>
            {viewError && (
              <Box style={{ padding: `2rem` }}>
                <ImportErrorView
                  importError={importError}
                  importErrorView={importErrorView}
                  errorMessage={errorMessage}
                ></ImportErrorView>
                <Flex
                  align={'center'}
                  style={{ width: '100%', marginTop: `2rem` }}
                  justify={'center'}
                >
                  <button
                    type="button"
                    className="rcm-button"
                    data-variant="ghost"
                    onClick={() => {
                      cancelImport();
                    }}
                  >
                    닫기
                  </button>
                </Flex>
              </Box>
            )}
            {preview && (
              <Box style={{ padding: `2rem` }}>
                <DataImportPreview data={data} fields={fields} />
                <Flex
                  gap={10}
                  align={'center'}
                  style={{ width: '100%', marginTop: `2rem` }}
                  justify={'center'}
                >
                  <button
                    type="button"
                    className="rcm-button"
                    data-variant="primary"
                    onClick={() => {
                      onSubmit();
                    }}
                  >
                    업로드
                  </button>
                  <button
                    type="button"
                    className="rcm-button"
                    data-variant="outline"
                    onClick={() => {
                      cancelImport();
                    }}
                  >
                    취소
                  </button>
                </Flex>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
};

export interface DataImportPreviewProps {
  fields: DataField[];
  data: DataRowSet;
}

export const DataImportPreview: FC<DataImportPreviewProps> = ({ fields, data }) => {
  function showRows() {
    let rowFields: ReactNode[] = [];
    data?.forEach((row: DataRow, index: number) => {
      if (index > 0) {
        rowFields.push(
          <Table.Tr key={'row_' + index}>
            <Table.Td className={classes.row} key={'cell_index_' + index}>
              {index}
            </Table.Td>
            {(function () {
              const cells: ReactNode[] = [];
              fields.map((field, index) => {
                const fieldName = field.getName();
                cells.push(
                  <Table.Td className={classes.row} key={'cell_' + fieldName + '_' + index}>
                    {defaultString(row.find((r) => r.name === fieldName)?.value)}
                  </Table.Td>,
                );
              });
              return cells;
            })()}
          </Table.Tr>,
        );
      }
    });
    return rowFields;
  }

  return (
    <Grid>
      <Grid.Col span={12}>
        <Paper style={{ padding: 2, width: '100%' }}>
          <SafePerfectScrollbar>
            <Table border={1} borderColor={'#ff0'}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={classes.header} key={'body_header_index'}>
                    #
                  </Table.Th>
                  {fields.map((field, index) => (
                    <th className={classes.header} key={'body_' + field + '_' + index}>
                      <div>
                        <div>[{field.getName()}]</div>
                        {field.getLabel()}
                      </div>
                    </th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <>{showRows()}</>
              </Table.Tbody>
            </Table>
          </SafePerfectScrollbar>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
