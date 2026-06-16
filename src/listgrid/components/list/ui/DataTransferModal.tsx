import { SearchForm } from '../../../form/SearchForm';
import { DataTransferConfig } from '../../../transfer/Type';
import { getDataTransfer } from '../../../transfer/registry';
import { isTrue } from '../../../utils/BooleanUtil';

export const DataTransferModals: React.FC<{
  openDownload: boolean;
  setOpenDownload: (open: boolean) => void;
  openUpload: boolean;
  setOpenUpload: (open: boolean) => void;
  dataTransferConfig?: DataTransferConfig;
  searchForm: SearchForm;
  title: string;
  refresh: () => void;
}> = ({
  openDownload,
  setOpenDownload,
  openUpload,
  setOpenUpload,
  dataTransferConfig,
  searchForm,
  title,
  refresh,
}) => {
  // The concrete Exporter/Importer (which pull `xlsx-js-style` / `file-saver`)
  // are injected by the host via `@rchemist/listgrid/excel`. When the host has
  // not opted in, the export/import actions degrade gracefully — nothing renders.
  const transfer = getDataTransfer();
  if (!transfer) return null;
  const { Exporter, Importer } = transfer;

  return (
    <>
      {openDownload && (
        <Exporter
          {...(dataTransferConfig?.export !== undefined
            ? { config: dataTransferConfig.export }
            : {})}
          searchForm={searchForm}
          fileName={dataTransferConfig?.getExportFileName() ?? 'export'}
          onClose={() => setOpenDownload(false)}
        />
      )}
      {openUpload && (
        <Importer
          {...(dataTransferConfig?.import !== undefined
            ? { config: dataTransferConfig.import }
            : {})}
          sampleFileName={`${title}_Sample`}
          onClose={(result: boolean) => {
            setOpenUpload(false);
            if (isTrue(result)) {
              refresh();
            }
          }}
        />
      )}
    </>
  );
};
