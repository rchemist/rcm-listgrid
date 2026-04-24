import { FieldType } from '../config/Config';
import { getEndpoint } from '../config/RuntimeConfig';
import { fDate, fDateTime } from '../misc';
import { ReactNode } from 'react';
import { isTrue } from '../utils/BooleanUtil';
import { getPlainText } from '../ui';
import {
  defaultString,
  isBlank,
  subStringAfterLast,
  subStringBeforeLast,
} from '../utils/StringUtil';
import { isEmpty } from '../utils';
import { SelectOption } from '../form/Type';

export interface IDataTransferProperty {
  name: string;
  propertyName: string;
  helpText?: string | undefined;
  order?: number | undefined;
  tabId?: string | undefined;
  fieldGroupId?: string | undefined;
}

export class DataTransferProperty implements IDataTransferProperty {
  name: string;
  propertyName: string;
  helpText?: string | undefined;
  order?: number | undefined;
  tabId?: string | undefined;
  fieldGroupId?: string | undefined;

  constructor(data: IDataTransferProperty) {
    this.name = data.name;
    this.propertyName = data.propertyName;
    this.helpText = data.helpText;
    this.order = data.order;
    this.tabId = data.tabId;
    this.fieldGroupId = data.fieldGroupId;
  }

  static fromJson(data: IDataTransferProperty): DataTransferProperty {
    return new DataTransferProperty(data);
  }

  static fromJsonArray(data: IDataTransferProperty[]): DataTransferProperty[] {
    return data.map((item) => DataTransferProperty.fromJson(item));
  }

  withHelpText(helpText: string): DataTransferProperty {
    this.helpText = helpText;
    return this;
  }

  withOrder(order: number): DataTransferProperty {
    this.order = order;
    return this;
  }

  withTabId(tabId: string): DataTransferProperty {
    this.tabId = tabId;
    return this;
  }

  withFieldGroupId(fieldGroupId: string): DataTransferProperty {
    this.fieldGroupId = fieldGroupId;
    return this;
  }

  isConfigured(...configuredForms: string[]): boolean {
    const tabId = this.tabId ? this.tabId : '';
    const fieldGroupId = this.fieldGroupId ? this.fieldGroupId : '';

    const form = DataTransferProperty.getForm(tabId, fieldGroupId);

    try {
      configuredForms.forEach((configuredForm) => {
        if (configuredForm === form) {
          throw new Error('configured');
        }
      });
    } catch (e) {
      //
      return true;
    }

    return false;
  }

  static getForm(tabId: string, fieldGroupId: string): string {
    return tabId + '_' + fieldGroupId;
  }
}

export interface DataManageType {
  exportable: boolean;
  importable: boolean;
}

export interface IDataTransferConfig {
  type: DataManageType;
  export?: TransferConfig | undefined;
  import?: ImportTransferConfig | undefined;
  refreshView?: boolean | undefined;
  exportFileName?: string | undefined;
}

export const DataTransferAll: DataManageType = {
  exportable: true,
  importable: true,
};

export const DataTransferNotSupport: DataManageType = {
  exportable: false,
  importable: false,
};

export const DataTransferExportOnly: DataManageType = {
  exportable: true,
  importable: false,
};

export const DataTransferImportOnly: DataManageType = {
  exportable: false,
  importable: true,
};

export interface DataColumn {
  name: string;
  value: any;
}

export type DataRow = DataColumn[];
export type DataRowSet = DataRow[];

export type SampleDataItem = {
  name: string;
  value: any;
};

export interface ImportTransferConfig extends TransferConfig {
  // 엑셀 업로드 시 샘플 데이터
  sampleData?: SampleDataItem[][] | undefined;

  // 엑셀 업로드 시 파싱 결과 조작 - 업로드가 끝난 후 업로드 된 결과를 가지고 추가 처리를 해야 할 때 사용한다.
  overrideParseResult?:
    | ((
        formData: DataRowSet,
        response: unknown,
      ) => { success: boolean; result: DataTransferResult; error?: string; errorView?: ReactNode })
    | undefined;

  mode?:
    | {
        create?: boolean;
        update?: boolean;
      }
    | undefined;
}

export interface ExportTransferConfig extends TransferConfig {}

export interface TransferConfig {
  fields?: DataField[] | undefined;

  // 엑셀 업로드 / 다운로드 시 api 호출 경로
  url?: string | undefined;

  // 엑셀 업로드/다운로드 시 모달 창 하단 설명
  description?: ReactNode | undefined;

  // 엑셀 데이터가 formData 로 저장된 후 실제 API 를 호출하기 전에 formData 에 필드를 추가할 수 있다.
  // formData 자체를 조작하는 overrideFormData 와 달리 row 단위로 실행되며 단순히 필드를 추가할 때 쉽게 사용하기 위해 추가한다.
  addedFields?: ((row: DataRow) => Promise<DataRow>) | undefined;

  // 엑셀 업로드/다운로드 시 폼 데이터 조작 - 전체 데이터에 대해 조작한다.
  overrideFormData?: ((formData: DataRowSet) => Promise<DataRowSet>) | undefined;
}

export class DataTransferConfig implements IDataTransferConfig {
  type: DataManageType;
  export?: ExportTransferConfig | undefined = { fields: [] };
  import?: ImportTransferConfig | undefined = { fields: [] };

  exportFileName?: string | undefined;

  constructor(data: IDataTransferConfig, url: string) {
    this.type = data.type ? data.type : { exportable: true, importable: true };
    this.export = data.export ? data.export : { fields: [] };
    this.import = data.import ? data.import : { fields: [] };
    this.exportFileName = data.exportFileName;

    const defaultImportMode = { create: true, update: true };
    const importMode = data.import?.mode ?? defaultImportMode;
    if (this.import) {
      this.import.mode = importMode;
    } else {
      this.import = { fields: [], mode: importMode };
    }

    if (this.export.url === undefined) {
      this.export.url = url;
    }

    if (this.import.url === undefined) {
      // 엑셀 업로드 기본 경로 (RuntimeConfig.endpoints.excelUpload 로 오버라이드 가능)
      this.import.url = url + getEndpoint('excelUpload');
    }
  }

  isSupportExport(): boolean {
    return isTrue(this.type.exportable);
  }

  isSupportImport(): boolean {
    return isTrue(this.type.importable);
  }

  private isImportUpdateEnabled(): boolean {
    return this.import?.mode?.update !== false;
  }

  withExportableFields(...exportableFields: DataField[]): DataTransferConfig {
    if (this.export) {
      this.export.fields = exportableFields;
    } else {
      this.export = { fields: exportableFields };
    }
    return this;
  }

  withImportableFields(...importableFields: DataField[]): DataTransferConfig {
    if (this.import) {
      this.import.fields = importableFields;
    } else {
      this.import = { fields: importableFields };
    }
    return this;
  }

  withExportUrl(exportUrl: string): DataTransferConfig {
    if (this.export) {
      this.export.url = exportUrl;
    } else {
      this.export = { fields: [], url: exportUrl };
    }
    return this;
  }

  withImportUrl(importUrl: string): DataTransferConfig {
    if (this.import) {
      this.import.url = importUrl;
    } else {
      this.import = { fields: [], url: importUrl };
    }
    return this;
  }

  withExportFileName(exportFileName: string): DataTransferConfig {
    this.exportFileName = exportFileName;
    return this;
  }

  withImportSampleData(importSampleData: SampleDataItem[][]): DataTransferConfig {
    if (this.import) {
      this.import.sampleData = importSampleData;
    } else {
      this.import = { fields: [], sampleData: importSampleData };
    }
    return this;
  }

  withAddedExportFields(addedFields?: (row: DataRow) => Promise<DataRow>): DataTransferConfig {
    if (this.export) {
      this.export.addedFields = addedFields;
    } else {
      this.export = { fields: [], addedFields: addedFields };
    }
    return this;
  }

  withAddedImportFields(addedFields?: (row: DataRow) => Promise<DataRow>): DataTransferConfig {
    if (this.import) {
      this.import.addedFields = addedFields;
    } else {
      this.import = { fields: [], addedFields: addedFields };
    }
    return this;
  }

  withOverrideExportFormData(
    overrideFormData?: (formData: DataRowSet) => Promise<DataRowSet>,
  ): DataTransferConfig {
    if (this.export) {
      this.export.overrideFormData = overrideFormData;
    } else {
      this.export = { fields: [], overrideFormData: overrideFormData };
    }
    return this;
  }

  withOverrideImportFormData(
    overrideFormData?: (formData: DataRowSet) => Promise<DataRowSet>,
  ): DataTransferConfig {
    if (this.import) {
      this.import.overrideFormData = overrideFormData;
    } else {
      this.import = { fields: [], overrideFormData: overrideFormData };
    }
    return this;
  }

  getExportFileName(): string {
    return this.exportFileName || 'export';
  }

  setDataFields(dataFields: DataField[]) {
    if (dataFields.length === 0) {
      return;
    }

    if (!this.export) {
      this.export = { fields: [] };
    }
    if (!this.import) {
      this.import = { fields: [] };
    }

    this.export.fields = this.updateFields(
      this.export.fields ?? [],
      dataFields,
      this.isSupportExport(),
      { ensureId: true },
    );
    this.import.fields = this.updateFields(
      this.import.fields ?? [],
      dataFields,
      this.isSupportImport(),
      { ensureId: this.isImportUpdateEnabled() },
    );
  }

  private updateFields(
    existingFields: DataField[],
    dataFields: DataField[],
    isSupported: boolean,
    options?: { ensureId?: boolean },
  ): DataField[] {
    if (isSupported) {
      if (existingFields.length === 0) {
        existingFields.push(...dataFields);
      } else {
        dataFields.forEach((dataField) => {
          if (!existingFields.find((field) => field.equals(dataField))) {
            existingFields.push(dataField);
          }
        });
      }
    }

    const ensureId = options?.ensureId ?? true;
    return this.applyIdPolicy(existingFields, ensureId);
  }

  private applyIdPolicy(fields: DataField[], ensureId: boolean): DataField[] {
    if (ensureId) {
      const hasId = fields.some((field) => field.getName() === 'id');
      if (!hasId) {
        return [DataField.create({ name: 'id', label: '아이디', type: 'text' }), ...fields];
      }
      return fields;
    }

    return fields.filter((field) => field.getName() !== 'id');
  }

  withExportDescription(description: ReactNode): DataTransferConfig {
    if (this.export) {
      this.export.description = description;
    } else {
      this.export = { fields: [], description: description };
    }
    return this;
  }

  withImportDescription(description: ReactNode): DataTransferConfig {
    if (this.import) {
      this.import.description = description;
    } else {
      this.import = { fields: [], description: description };
    }
    return this;
  }

  withImportOverrideParseResult(
    overrideParseResult: (
      formData: DataRowSet,
      response: unknown,
    ) => { success: boolean; result: DataTransferResult; error?: string; errorView?: ReactNode },
  ): DataTransferConfig {
    if (this.import) {
      this.import.overrideParseResult = overrideParseResult;
    } else {
      this.import = { fields: [], overrideParseResult: overrideParseResult };
    }
    return this;
  }

  validateDataFields(defaultFields: DataField[]) {
    // 이 class 인스턴스를 사용하기 전 반드시 initialize 를 해야 한다.
    // fields 설정을 조정하기 위해서이다.
    if (this.isSupportExport()) {
      if (!this.export) {
        this.export = { fields: [] };
      }
      if (isEmpty(this.export.fields)) {
        this.export.fields = this.applyIdPolicy([...defaultFields], true);
      }
    }

    if (this.isSupportImport()) {
      if (!this.import) {
        this.import = { fields: [] };
      }
      if (isEmpty(this.import.fields)) {
        this.import.fields = this.applyIdPolicy([...defaultFields], this.isImportUpdateEnabled());
      }
    }
  }
}

export interface DataTransferResult {
  requested: number;
  created?: number;
  updated?: number;
  failed?: number;
  errors?: DataTransferResultError[];
}

export interface DataTransferResultError {
  row?: number;
  field?: string;
  message?: string;
}

export interface DataTransferRule {
  changeValueOnExport?: (value: any) => Promise<any>;
  changeValueOnImport?: (value: any) => Promise<any>;
}

export interface DataFieldProps {
  name: string;
  label: string;
  type: FieldType;
  description?: string | undefined;
  required?: boolean | undefined; // import 할 때 validation 용으로 사용한다.
  options?: SelectOption[] | undefined;
  dataTransferRule?: DataTransferRule | undefined;
}

export class DataField {
  private readonly name: string;
  private readonly label: string;
  private readonly type: FieldType;
  private description?: string | undefined;
  private required?: boolean | undefined;
  private options?: SelectOption[] | undefined;
  private dataTransferRule?: DataTransferRule | undefined;

  constructor({
    name,
    label,
    type,
    description,
    options,
    dataTransferRule,
    required,
  }: DataFieldProps) {
    this.name = name;
    this.label = label;
    this.description = description;
    this.type = type;
    this.required = required;
    this.options = options;
    this.dataTransferRule = dataTransferRule;
  }

  public static create(props: DataFieldProps): DataField {
    return new DataField(props);
  }

  equals(other: DataField): boolean {
    return this.getName() === other.getName();
  }

  getName(): string {
    return this.name;
  }

  getLabel(): string {
    return this.label;
  }

  isRequired(): boolean {
    return isTrue(this.required);
  }

  getType(): FieldType {
    return this.type;
  }

  getOptions(): SelectOption[] {
    return this.options ?? [];
  }

  async getValueOnExport(value: any): Promise<any> {
    if (this.dataTransferRule?.changeValueOnExport) {
      return await this.dataTransferRule?.changeValueOnExport(value);
    }

    if (value === undefined || value === null) {
      return '';
    }

    if (this.type === 'select') {
      if (this.options) {
        const option = this.options?.find((option) => option.value === value);
        return option ? option.label : value;
      }
    } else if (this.type === 'multiselect') {
      if (this.options) {
        const val = value + '';
        if (val === '') {
          return '';
        }
        // multi select value
        if (val.includes('|||')) {
          const values = val.split('|||');
          return values
            .map((value) => {
              const option = this.options?.find((option) => option.value === value);
              return option ? (option.label ?? option.value) : value;
            })
            .join(',');
        } else {
          const option = this.options?.find((option) => option.value === value);
          return option ? (option.label ?? option.value) : value;
        }
      }
    } else if (this.type === 'datetime') {
      return await getRangeDatetimeValue(value);
    } else if (this.type === 'boolean') {
      const bool = isTrue(value);
      return bool ? '예' : '아니오';
    } else if (this.type === 'html') {
      return getPlainText(value);
    } else if (this.type === 'markdown') {
      return getPlainText(value);
    } else if (this.type === 'date') {
      return await getRangeDateValue(value);
    }

    return value;
  }

  async getValueOnImport(value: any): Promise<any> {
    if (this.dataTransferRule?.changeValueOnImport) {
      return await this.dataTransferRule?.changeValueOnImport(value);
    }

    if (this.type === 'select') {
      const option = this.options?.find((option) => option.label === value);
      return option ? option.value : value;
    } else if (this.type === 'multiselect') {
      const val = value + '';
      if (val === '') {
        return '';
      }
      // multi select value
      if (val.includes(',')) {
        const values = val.split('|||');
        return values
          .map((value) => {
            const option = this.options?.find((option) => option.label === value);
            return option ? option.value : value;
          })
          .join('|||');
      } else {
        const option = this.options?.find((option) => option.label === value);
        return option ? option.value : value;
      }
    } else if (this.type === 'datetime') {
      return await getImportedRangeDatetimeValue(value);
    } else if (this.type === 'date') {
      return await getImportedRangeDateValue(value);
    } else if (this.type === 'boolean') {
      return isTrue(value);
    } else if (this.type === 'html') {
      return value;
    } else if (this.type === 'markdown') {
      return value;
    }

    return value;
  }

  withRequired(required: boolean): DataField {
    this.required = required;
    return this;
  }

  withOptions(options: SelectOption[]): DataField {
    this.options = options;
    return this;
  }

  withChangeValueOnExport(changeValueOnExport: (value: any) => any): DataField {
    if (this.dataTransferRule) {
      this.dataTransferRule.changeValueOnExport = changeValueOnExport;
    } else {
      this.dataTransferRule = {
        changeValueOnExport: changeValueOnExport,
      };
    }
    return this;
  }

  withChangeValueOnImport(changeValueOnImport: (value: any) => any): DataField {
    if (this.dataTransferRule) {
      this.dataTransferRule.changeValueOnImport = changeValueOnImport;
    } else {
      this.dataTransferRule = {
        changeValueOnImport: changeValueOnImport,
      };
    }
    return this;
  }

  withDescription(description: string): DataField {
    this.description = description;
    return this;
  }

  getDescription(): string {
    return defaultString(this.description);
  }
}

export interface DataExportCount {
  totalPage: number;
  totalCount?: number;
}

export interface DataExportResult {
  // Raw server page payload — shape determined by host API.
  data: unknown;
  page: number;
}

export function createFieldMap(...fields: DataField[]): Map<string, DataField> {
  const fieldMap: Map<string, DataField> = new Map();

  fields.forEach((field) => {
    fieldMap.set(field.getName(), field);
  });

  return fieldMap;
}

export function getExportFileName(
  exportFileName: string | undefined,
  translation: (key: string) => string,
) {
  let fileName = exportFileName || 'export_file';

  // replace translation
  fileName = translation(fileName);

  // replace space to underscore
  fileName = fileName.replace(/ /g, '_');

  let postfix = '';

  if (fileName.includes('.')) {
    postfix = subStringAfterLast(fileName, '.');
    fileName = subStringBeforeLast(fileName, '.');
  }

  // add current date to file name
  const date = fDateTime(new Date(), 'yyyyMMddHHmmss');
  fileName = fileName + '_' + date;

  if (!isBlank(postfix)) {
    fileName = fileName + '.' + postfix;
  } else {
    fileName = fileName + '.xlsx';
  }

  return fileName;
}

// 타입 가드 함수들
export function isDataColumn(value: unknown): value is DataColumn {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as DataColumn).name === 'string' &&
    'value' in value
  );
}

export function isDataRow(value: unknown): value is DataRow {
  return Array.isArray(value) && value.every(isDataColumn);
}

export function isDataRowSet(value: unknown): value is DataRowSet {
  return Array.isArray(value) && value.every(isDataRow);
}

export function isSampleDataItem(value: unknown): value is SampleDataItem {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SampleDataItem).name === 'string' &&
    'value' in value
  );
}

export async function getRangeDateValue(value: any): Promise<any> {
  // value 가 배열이면 배열의 첫번째 요소를 반환
  if (value !== undefined) {
    if (Array.isArray(value)) {
      if (value.length == 2) {
        return fDate(value[0]) + ' ~ ' + fDate(value[1]);
      } else if (value.length == 1) {
        return fDate(value[0]);
      }
    }
  }

  return value;
}

export async function getRangeDatetimeValue(value: any): Promise<any> {
  // value 가 배열이면 배열의 첫번째 요소를 반환
  if (value !== undefined) {
    if (Array.isArray(value)) {
      if (value.length == 2) {
        return fDateTime(value[0]) + ' ~ ' + fDateTime(value[1]);
      } else if (value.length == 1) {
        return fDateTime(value[0]);
      }
    }
  }

  return value;
}

export async function getImportedRangeDateValue(value: any): Promise<any> {
  if (value !== undefined) {
    const valueString = value + '';
    if (valueString.includes(' ~ ')) {
      const values = valueString.split(' ~ ');
      return [fDate(values[0]!), fDate(values[1]!)];
    } else if (valueString.includes('~')) {
      const values = valueString.split('~');
      return [fDate(values[0]!), fDate(values[1]!)];
    } else if (valueString.includes(',')) {
      const values = valueString.split(',');
      return [fDate(values[0]!), fDate(values[1]!)];
    } else {
      // 단일값
      return fDate(value);
    }
  }
  return value;
}

export async function getImportedRangeDatetimeValue(value: any): Promise<any> {
  if (value !== undefined) {
    const valueString = value + '';
    if (valueString.includes(' ~ ')) {
      const values = valueString.split(' ~ ');
      return [fDateTime(values[0]!), fDateTime(values[1]!)];
    } else if (valueString.includes('~')) {
      const values = valueString.split('~');
      return [fDateTime(values[0]!), fDateTime(values[1]!)];
    } else if (valueString.includes(',')) {
      const values = valueString.split(',');
      return [fDateTime(values[0]!), fDateTime(values[1]!)];
    } else {
      // 단일값
      return fDateTime(value);
    }
  }
  return value;
}
