# ContentAssetField 사용 가이드

## 개요

ContentAssetField는 범용적인 파일 업로드 및 관리를 위한 ListGrid 커스텀 필드입니다. 다양한 도메인에서 파일 자산을 관리할 수 있도록 설계되었습니다.

## 주요 기능

- 파일 업로드 및 삭제
- 제목 및 설명 입력
- 제목 중복 검증
- 실시간 유효성 검사
- 반응형 디자인
- 드래그 앤 드롭 지원 (FileUploadInput 통해)

## 사용 방법

### 1. 기본 사용법

```typescript
import { ContentAssetField } from '@/components/listgrid/components/fields/contentasset';

// EntityForm에서 사용
const contentField = ContentAssetField.create({
  name: 'documents',
  order: 10,
  label: '첨부 문서',
  required: true,
  placeholder: '문서를 추가해주세요'
});
```

### 2. 옵션 설정

```typescript
const contentField = ContentAssetField.create({
  name: 'attachments',
  order: 20,
  label: '첨부 파일',
  required: false,
  maxItems: 5, // 최대 5개까지 업로드 가능
  acceptedFileTypes: ['image/*', 'application/pdf'], // 이미지와 PDF만 허용
  maxFileSize: 5 * 1024 * 1024, // 5MB 제한
  defaultValue: [] // 빈 배열로 시작
});
```

### 3. 데이터 구조

```typescript
// ContentAsset 인터페이스
interface ContentAsset {
  id?: string;      // 백엔드에서 받은 고유 식별자
  title: string;    // 컨텐츠 제목 (필수, 중복 불가)
  content?: string; // 부가 설명 텍스트
  assetUrl: string; // 업로드된 파일의 URL
}

// 값 예시
const value: ContentAsset[] = [
  {
    id: '1',
    title: '사업 계획서',
    content: '2025년도 사업 계획 문서입니다.',
    assetUrl: 'https://example.com/files/business-plan.pdf'
  },
  {
    id: '2',
    title: '재무제표',
    content: '2024년 4분기 재무제표',
    assetUrl: 'https://example.com/files/financial-statement.xlsx'
  }
];
```

### 4. EntityForm에서 전체 예시

```typescript
import { EntityForm } from '@/components/listgrid/config/EntityForm';
import { StringField } from '@/components/listgrid/components/fields/StringField';
import { ContentAssetField } from '@/components/listgrid/components/fields/contentasset';

export const DocumentEntityForm = () => {
  const entityForm = EntityForm.create({
    code: 'document',
    resource: '/api/documents',
    title: '문서 관리',
    fields: [
      StringField.create({
        name: 'title',
        order: 1,
        label: '문서 제목',
        required: true
      }),
      ContentAssetField.create({
        name: 'attachments',
        order: 2,
        label: '첨부 파일',
        required: true,
        maxItems: 10,
        placeholder: '파일을 업로드하세요',
        acceptedFileTypes: ['application/pdf', 'image/*'],
        maxFileSize: 10 * 1024 * 1024 // 10MB
      })
    ]
  });

  return entityForm;
};
```

## 속성 설명

| 속성 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | string | O | 필드 이름 |
| order | number | O | 필드 순서 |
| label | string | X | 필드 라벨 |
| required | boolean | X | 필수 입력 여부 |
| placeholder | string | X | 플레이스홀더 텍스트 |
| maxItems | number | X | 최대 업로드 가능한 항목 수 |
| acceptedFileTypes | string[] | X | 허용된 파일 타입 (MIME 타입) |
| maxFileSize | number | X | 최대 파일 크기 (bytes) |
| defaultValue | ContentAsset[] | X | 기본값 |
| readonly | boolean | X | 읽기 전용 모드 |

## 유효성 검사

ContentAssetField는 다음과 같은 유효성 검사를 자동으로 수행합니다:

1. **제목 필수**: 각 항목의 제목은 필수 입력
2. **제목 중복 방지**: 동일한 제목 사용 불가 (대소문자 구분 없음)
3. **파일 필수**: 각 항목에 파일 업로드 필수
4. **최대 항목 수**: maxItems 설정 시 제한
5. **파일 타입**: acceptedFileTypes 설정 시 제한
6. **파일 크기**: maxFileSize 설정 시 제한

## 차별화 요소 (AdmissionAssetField 대비)

1. **범용성**: 특정 도메인(입학)에 종속되지 않음
2. **단순화**: Custom Option 제거, 직접 입력 방식만 지원
3. **유연성**: 다양한 컨텍스트에서 사용 가능
4. **접근성**: 모든 사용자에게 동일한 권한 부여

## 주의사항

1. 실제 파일 업로드 로직은 FileUploadInput 컴포넌트의 설정에 따라 동작
2. 파일 URL은 백엔드 API와 연동하여 실제 업로드 후 받아야 함
3. 현재 구현은 로컬 URL 생성 (URL.createObjectURL) 사용 - 프로덕션에서는 실제 업로드 로직 필요