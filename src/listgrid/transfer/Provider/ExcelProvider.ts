import { isTrue } from '../../utils/BooleanUtil';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx-js-style';
import { DataField, DataRowSet, isDataRowSet } from '../Type';
import { getEndpoint } from '../../config/RuntimeConfig';

export interface ExcelDownloadLogOptions {
  condition?: Record<string, any> | string | undefined;
}

export interface ExcelDownloadProps {
  data: DataRowSet; // any 제거
  fileName: string;
  excludeHeader?: boolean | undefined;
  password?: string | undefined;
  logOptions?: ExcelDownloadLogOptions | undefined;
  fields?: DataField[] | undefined;
}

export async function logExcelDownload(
  usePassword: boolean,
  condition?: Record<string, any> | string,
): Promise<void> {
  try {
    const url = typeof window !== 'undefined' ? window.location.pathname : '';
    const raw = typeof condition === 'string' ? condition : JSON.stringify(condition || {});
    const conditionStr = raw.substring(0, 2000);
    const { callExternalHttpRequest } = await import('../../utils/RequestUtil');
    await callExternalHttpRequest({
      url: getEndpoint('excelDownloadHistory'),
      method: 'POST',
      formData: { url, condition: conditionStr, usePassword },
    });
  } catch (e) {
    console.error('Excel download log failed:', e);
  }
}

// Password-protected Excel encryption is Node-only (officecrypto-tool + Buffer).
// Lazy-resolved so browser bundles don't blow up on import; host apps that need
// the feature install `officecrypto-tool` as a peer and call
// `registerExcelCrypto(require('officecrypto-tool'))` at bootstrap.
interface OfficeCrypto {
  encrypt: (buffer: unknown, opts: { password: string }) => Promise<unknown>;
  isEncrypted: (data: unknown) => Promise<boolean>;
}
let officeCrypto: OfficeCrypto | null = null;
export function registerExcelCrypto(impl: OfficeCrypto): void {
  officeCrypto = impl;
}
function mustOfficeCrypto(): OfficeCrypto {
  if (!officeCrypto) {
    throw new Error(
      '[@rchemist/listgrid] password-protected Excel export requires officecrypto-tool. ' +
        "Install it and call registerExcelCrypto(require('officecrypto-tool')).",
    );
  }
  return officeCrypto;
}
function toNodeBuffer(data: ArrayBuffer | Uint8Array): unknown {
  // (globalThis as any) kept — Node Buffer polyfill surface is untyped in browser builds
  const B: any = (globalThis as any).Buffer;
  if (!B) {
    throw new Error(
      '[@rchemist/listgrid] password-protected Excel export needs a Node Buffer polyfill in the browser.',
    );
  }
  return B.from(data);
}

export const ExcelDownload = async (props: ExcelDownloadProps) => {
  try {
    const skipHeader = isTrue(props.excludeHeader);
    //const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(props.data, { skipHeader: isTrue(props.excludeHeader) });

    // 타입 검증
    if (!isDataRowSet(props.data)) {
      throw new Error('Invalid data format: data must be a DataRowSet');
    }

    // 헤더와 데이터 분리
    const [headerRow, ...dataRows] = props.data;

    // 헤더에서 컬럼 순서와 레이블 가져오기
    const columnOrder = headerRow!.map((col) => ({
      name: col.name,
      label: col.value,
    }));

    // 헤더 행 추가
    const aoaData = [
      columnOrder.map((col) => `${col.label}\n[${col.name}]`),
      // 데이터 행 변환 (컬럼 순서 보장)
      ...dataRows.map((row) => {
        // Map으로 변환하여 O(1) 접근 가능하게 함
        const rowMap = new Map(row.map((col) => [col.name, col.value]));
        return columnOrder.map((col) => rowMap.get(col.name) ?? '');
      }),
    ];

    let ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(aoaData);

    // 필드 정보를 이용해 셀 타입 및 서식 지정
    if (props.fields && props.fields.length > 0) {
      const fieldMap = new Map(props.fields.map((f) => [f.getName(), f]));
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

      for (let R = 1; R <= range.e.r; ++R) {
        // 헤더 이후 데이터 행부터
        for (let C = 0; C <= range.e.c; ++C) {
          const colName = columnOrder[C]?.name;
          if (!colName) continue;
          const field = fieldMap.get(colName);

          if (field) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellAddress];

            if (cell) {
              // 0으로 시작하는 숫자 등을 문자열로 유지하기 위해 text 타입 필드 처리
              // select, multiselect 등도 텍스트로 취급될 수 있음
              const fieldType = field.getType();
              if (
                fieldType === 'text' ||
                fieldType === 'select' ||
                fieldType === 'multiselect' ||
                fieldType === 'phone'
              ) {
                cell.t = 's'; // string type
                cell.z = '@'; // text format
              }
            }
          }
        }
      }
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // 만약 skipHeader 가 false 라면 맨 처음 행을 제거한다.
    if (!skipHeader) {
      // 워크시트 데이터를 JSON으로 변환
      const jsonData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }); // header: 1 -> 배열 형태

      // jsonData.shift(); // 첫 번째 행 제거

      // jsonData로 새로운 워크시트 생성
      ws = XLSX.utils.aoa_to_sheet(jsonData);
    }

    // 첫 두 행 스타일 적용
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    if (!skipHeader) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[cell_address]) continue; // 셀이 비어있을 경우 건너뜀
        if (!ws[cell_address].s) ws[cell_address].s = {};
        ws[cell_address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F1F5FE' } },
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    }

    // 열 너비 설정
    const columnWidths = Array.from({ length: range.e.c - range.s.c + 1 }).map((_, index) => {
      return { wch: 20 }; // 각 열의 너비를 20으로 설정
    });
    ws['!cols'] = columnWidths; // 열 너비를 워크시트에 적용

    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');

    const xlsx = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Step 2: 비밀번호가 있는 경우 xlsx-populate 처리
    let finalBlob: Blob;
    if (props.password) {
      // `officecrypto-tool`로 암호화
      const buffer = toNodeBuffer(xlsx);
      const encryptedData = await mustOfficeCrypto().encrypt(buffer, {
        password: props.password,
      });
      finalBlob = new Blob([encryptedData as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const isEncrypted = await mustOfficeCrypto().isEncrypted(encryptedData);

      if (!isEncrypted) {
        throw new Error('Failed to encrypt the file');
      }
    } else {
      // 비밀번호가 없는 경우 기본 Blob 사용
      finalBlob = new Blob([xlsx], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    // Step 3: 파일 저장
    let fileName = props.fileName;
    if (!fileName.toLowerCase().endsWith('.xlsx')) {
      fileName += '.xlsx';
    }
    FileSaver.saveAs(finalBlob, fileName);
    void logExcelDownload(!!props.password, props.logOptions?.condition);
  } catch (error) {
    console.error('Error in ExcelDownload:', error);
    throw error;
  }
};

export async function saveExcelFile(
  wb: XLSX.WorkBook,
  fileName: string,
  password?: string,
  logOptions?: ExcelDownloadLogOptions,
): Promise<void> {
  const xlsx = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  let finalBlob: Blob;
  if (password) {
    const buffer = toNodeBuffer(xlsx);
    const encryptedData = await mustOfficeCrypto().encrypt(buffer, { password });
    finalBlob = new Blob([encryptedData as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const isEncrypted = await mustOfficeCrypto().isEncrypted(encryptedData);
    if (!isEncrypted) {
      throw new Error('Failed to encrypt the file');
    }
  } else {
    finalBlob = new Blob([xlsx], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }
  if (!fileName.toLowerCase().endsWith('.xlsx')) {
    fileName += '.xlsx';
  }
  FileSaver.saveAs(finalBlob, fileName);
  void logExcelDownload(!!password, logOptions?.condition);
}

export default ExcelDownload;
