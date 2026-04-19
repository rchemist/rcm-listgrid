import { SearchForm } from '../../../form/SearchForm';
import { DataExporter } from '../../../transfer/DataExporter';
import { DataImporter } from '../../../transfer/DataImporter';
import { DataTransferConfig } from '../../../transfer/Type';
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
}) => (
  <>
    {openDownload && (
      <DataExporter
        {...(dataTransferConfig?.export !== undefined ? { config: dataTransferConfig.export } : {})}
        searchForm={searchForm}
        fileName={dataTransferConfig?.getExportFileName() ?? 'export'}
        onClose={() => setOpenDownload(false)}
      />
    )}
    {openUpload && (
      <DataImporter
        {...(dataTransferConfig?.import !== undefined ? { config: dataTransferConfig.import } : {})}
        sampleFileName={`${title}_Sample`}
        onClose={(result) => {
          setOpenUpload(false);
          if (isTrue(result)) {
            refresh();
          }
        }}
      />
    )}
  </>
);
