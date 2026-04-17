'use client';

import dynamic from 'next/dynamic';
import {Skeleton} from '@gjcu/ui/elements/indicator/Skeleton';
import {ComponentProps} from 'react';

// DataImporter와 XLSX를 동적으로 로드
const DynamicDataImporter = dynamic(
  () => import('./DataImporter').then(mod => ({ default: mod.DataImporter })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center p-8">
        <Skeleton height={40} width={200} mb="md" />
        <Skeleton height={200} width="100%" mb="md" />
        <div className="flex gap-2">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={80} />
        </div>
      </div>
    ),
    ssr: false, // 클라이언트에서만 로드
  }
);

// 원본 DataImporter와 동일한 Props 타입 사용
type DataImporterProps = ComponentProps<typeof import('./DataImporter').DataImporter>;

export const LazyDataImporter = (props: DataImporterProps) => {
  return <DynamicDataImporter {...props} />;
};

export default LazyDataImporter; 