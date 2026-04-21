import { SearchForm } from '../form/SearchForm';
import {
  createFieldMap,
  DataExportCount,
  DataField,
  DataRow,
  DataRowSet,
  SampleDataItem,
} from '../transfer/Type';
import { PageResult } from '../form/Type';
import { getPlainText } from '../ui';
import { isEmpty } from '../utils';

/**
 * 중첩 객체에서 dot notation 경로로 값을 가져온다.
 * 예: getNestedValue(item, 'semester.year') -> item.semester.year
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  // dot notation이 아니면 직접 접근
  if (!path.includes('.')) {
    return obj[path];
  }

  // dot notation 경로를 따라 값을 가져옴
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined;
    }
    value = value[key];
  }

  return value;
}

export interface ExportServiceProps {
  searchForm?: SearchForm | undefined;
  url?: string | undefined;
  fields: DataField[];
  restrictCount?: number | undefined;
  pagePerCount?: number | undefined;
  setExportable?: ((exportable: boolean) => void) | undefined;
  setFailedCount?: ((count: number) => void) | undefined;
  setProgress?: ((progress: number) => void) | undefined;
  data?: SampleDataItem[][] | undefined; // fetch 를 하지 않고 주어진 데이터만 export 하게 할 경우
  setData?: ((data: DataRowSet) => void) | undefined;
  setError?: ((errorMessage: string) => void) | undefined;
  editorFields?: string[] | undefined;
  addedFields?: ((row: DataRow) => Promise<DataRow>) | undefined;
}

export class DataExportService {
  searchForm?: SearchForm | undefined;
  url?: string | undefined;
  fields: DataField[];
  restrictCount: number;
  pagePerCount: number;
  setExportable: (exportable: boolean) => void;
  setFailedCount: (count: number) => void;
  setProgress: (progress: number) => void;
  data: SampleDataItem[][]; // fetch 를 하지 않고 주어진 데이터만 export 하게 할 경우 여기에 data 를 붙여 준다.
  setData: (data: DataRowSet) => void;
  setError: (errorMessage: string) => void;

  processing: boolean = false;
  total?: DataExportCount | undefined;
  editorFields: string[] = [];
  addedFields?: ((row: DataRow) => Promise<DataRow>) | undefined;

  constructor({
    searchForm,
    url,
    fields,
    restrictCount,
    pagePerCount,
    setExportable,
    setFailedCount,
    setProgress,
    data,
    setData,
    setError,
    editorFields,
    addedFields,
  }: ExportServiceProps) {
    this.searchForm = searchForm;
    this.url = url;
    this.fields = fields;
    this.restrictCount = restrictCount ?? 5000;
    this.pagePerCount = pagePerCount ?? 20;
    this.setExportable =
      setExportable ??
      function (_exportable: boolean) {
        // no-op default
      };
    this.setFailedCount =
      setFailedCount ??
      function (_count: number) {
        // no-op default
      };
    this.setProgress =
      setProgress ??
      function (_progress: number) {
        // no-op default
      };
    this.setData =
      setData ??
      function (_data: DataRowSet) {
        // no-op default
      };
    this.setError =
      setError ??
      function (_errorMessage: string) {
        // no-op default
      };
    this.data = data ?? [];
    if (data) {
      this.restrictCount = data.length;
      this.pagePerCount = data.length;
    }
    this.editorFields = editorFields ?? [];
  }

  process() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    let page = 0;
    let currentProgress: number = 0;
    let data: DataRowSet = [];
    const fieldMap: Map<string, DataField> = createFieldMap(...this.fields);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const exportData = async (): Promise<number> => {
      if (data.length === 0) {
        let subject: DataRow = [];
        fieldMap.forEach((value, _key) => {
          subject.push({ name: _key, value: value.getLabel() });
        });
        data.push(subject);
      }

      if (this.searchForm && this.url) {
        if (!this.total) {
          // total data 를 fetch 해야 한다. await 으로 처리해야 한다.

          const pageResult = await PageResult.fetchListData(this.url, this.searchForm).catch(
            (reason) => {
              throw new Error(reason);
            },
          );

          this.total = { totalPage: pageResult.totalPage || 0 };

          if (this.total.totalPage > this.restrictCount) {
            this.setExportable(false);
            this.setFailedCount(this.total.totalPage * this.pagePerCount);
            return 100;
          } else if (this.total.totalPage === 0) {
            this.setExportable(false);
            this.setFailedCount(0);
            return 100;
          }
        }

        if (currentProgress >= 100) {
          return 100;
        } else {
          if (page + 1 > this.total.totalPage) {
            return 100;
          }

          this.searchForm.withPage(page); // page 변경

          const pageResult = await PageResult.fetchListData(this.url, this.searchForm).catch(
            (reason) => {
              throw new Error(reason);
            },
          );

          // 실제 데이터 페치 부분
          await Promise.all(
            pageResult.list.map(async (item) => {
              const row: DataRow = [];

              await Promise.all(
                Array.from(fieldMap.entries()).map(async ([key, value]) => {
                  const fieldValue = getNestedValue(item, key);
                  if (this.editorFields.includes(key)) {
                    row.push({ name: key, value: getPlainText(fieldValue) || '' });
                  } else {
                    row.push({ name: key, value: await value.getValueOnExport(fieldValue) });
                  }
                }),
              );

              if (this.addedFields !== undefined) {
                const addedFields = await this.addedFields(row);
                if (addedFields) {
                  await Promise.all(
                    addedFields.map(async (column) => {
                      row.push(column);
                    }),
                  );
                }
              }

              data.push(row);
            }),
          );

          currentProgress = Math.floor(((page + 1) / this.total.totalPage) * 100);

          page++;
          return currentProgress;
        }
      } else if (this.data && !isEmpty(this.data)) {
        this.total = { totalPage: 1, totalCount: this.data.length };

        try {
          await Promise.all(
            this.data.map(async (item) => {
              try {
                const row: DataRow = [];

                await Promise.all(
                  Array.from(fieldMap.entries()).map(async ([key, value]) => {
                    let cellValue: any = {};
                    for (const cell of item) {
                      if (cell.name === key) {
                        cellValue = cell.value;
                        break;
                      }
                    }

                    if (this.editorFields.includes(key)) {
                      row.push({ name: key, value: getPlainText(cellValue) || '' });
                    } else {
                      row.push({ name: key, value: await value.getValueOnExport(cellValue) });
                    }
                  }),
                );

                if (this.addedFields) {
                  try {
                    const addedFields = await this.addedFields(row);
                    if (addedFields) {
                      await Promise.all(
                        addedFields.map(async (column) => {
                          row.push(column);
                        }),
                      );
                    }
                  } catch (error) {
                    console.error('Error in addedFields:', error);
                    throw error;
                  }
                }

                data.push(row);
              } catch (error) {
                console.error('Error processing item:', error);
                throw error;
              }
            }),
          );

          return 100;
        } catch (error) {
          console.error('Error processing data:', error);
          throw error;
        }
      } else {
        throw new Error('데이터를 검색할 수 없습니다.');
      }
    };

    // setTimeout 재귀 방식: 이전 작업 완료 후 다음 타이머 설정
    const processNext = async () => {
      try {
        if (currentProgress >= 100) {
          return;
        }

        const value = await exportData();
        currentProgress = value;
        this.setProgress(currentProgress);
        this.setData(data);

        // 완료되지 않았으면 다음 작업 예약
        if (currentProgress < 100) {
          timeoutId = setTimeout(processNext, 100);
        }
      } catch (e) {
        console.error(e);
        this.setProgress(100);
        this.setError('form.list.dataTransfer.tab.export.error.fetch');
      }
    };

    // 첫 번째 실행
    processNext();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }
}

export default DataExportService;
