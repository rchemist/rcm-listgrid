import { Tooltip } from '../../../ui';
import { useLoadingStore } from '../../../loading';
import { isTrue } from '../../../utils/BooleanUtil';
import { IconDownload, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { ListGridHeaderProps } from '../types/ListGridHeader.types';
import { CacheClearButton } from './buttons/CacheClearButton';
import { isEmpty } from '../../../utils';

export const HeaderActionButtons: React.FC<
  ListGridHeaderProps & { headerButtons: ReactNode[]; checkedButtons: ReactNode[] } & {
    setOpenDownload: (val: boolean) => void;
    setOpenUpload: (val: boolean) => void;
    neverDelete?: boolean;
  }
> = (props) => {
  const {
    headerButtons,
    supportPriority,
    isSubCollection,
    setManagePriority,
    cacheable,
    entityForm,
    setNotifications,
    setErrors,
    refresh,
    dataTransferConfig,
    setOpenDownload,
    setOpenUpload,
    enableHandleData,
    activeTrashIcon,
    deleteItems,
    neverDelete,
    checkedItems,
    checkedButtons,
    addNew,
    router,
    path,
    selectionOptions,
    rows,
    readonly,
  } = props;
  const { setOpenBaseLoading } = useLoadingStore();

  return (
    <div className="rcm-header-actions">
      {headerButtons}
      {supportPriority && !isSubCollection && (
        <Tooltip label="리스트 각 행의 맨 좌측 열을 드래그해 우선순위를 변경할 수 있습니다">
          <button
            type="button"
            className="rcm-button"
            data-variant="primary"
            onClick={setManagePriority}
          >
            우선순위 변경
          </button>
        </Tooltip>
      )}
      {cacheable && !isSubCollection && (
        <CacheClearButton
          entityForm={entityForm}
          setNotifications={setNotifications}
          setErrors={setErrors}
          onRefresh={refresh}
        />
      )}
      {!isSubCollection && !readonly && isTrue(dataTransferConfig?.isSupportExport()) && (
        <button
          type="button"
          className="rcm-button"
          data-variant="primary"
          onClick={() => setOpenDownload(true)}
        >
          <IconDownload className="rcm-btn-icon" />
          다운로드
        </button>
      )}
      {!isSubCollection && !readonly && isTrue(dataTransferConfig?.isSupportImport()) && (
        <button
          type="button"
          className="rcm-button"
          data-variant="primary"
          onClick={() => setOpenUpload(true)}
        >
          <IconUpload className="rcm-btn-icon" />
          업로드
        </button>
      )}
      {/* selection.actions 버튼들 - actions가 명시적으로 설정된 경우 항상 표시 */}
      {!isEmpty(checkedItems) && checkedButtons.length > 0 && selectionOptions?.actions && (
        <>{checkedButtons}</>
      )}

      {enableHandleData && (
        <>
          {!isSubCollection &&
            activeTrashIcon &&
            (() => {
              const deleteButton = selectionOptions?.deleteButton;
              const isDeleteButtonObject = deleteButton && typeof deleteButton === 'object';

              return (
                <button
                  type="button"
                  className={
                    isDeleteButtonObject && deleteButton.className
                      ? deleteButton.className
                      : 'rcm-button'
                  }
                  data-variant={
                    isDeleteButtonObject && deleteButton.className ? undefined : 'outline'
                  }
                  data-color={isDeleteButtonObject && deleteButton.className ? undefined : 'error'}
                  onClick={async () => {
                    // 삭제 확인 메시지
                    if (isDeleteButtonObject && deleteButton.confirmMessage) {
                      const message =
                        typeof deleteButton.confirmMessage === 'function'
                          ? deleteButton.confirmMessage(checkedItems || [])
                          : deleteButton.confirmMessage;
                      if (!confirm(message)) return;
                    }

                    deleteItems();
                  }}
                >
                  {isDeleteButtonObject && deleteButton.icon ? (
                    deleteButton.icon
                  ) : (
                    <IconTrash className="rcm-btn-icon" />
                  )}
                  {isDeleteButtonObject && deleteButton.label
                    ? typeof deleteButton.label === 'function'
                      ? deleteButton.label(checkedItems || [])
                      : deleteButton.label
                    : isTrue(neverDelete)
                      ? '사용 중지'
                      : '선택 삭제'}
                </button>
              );
            })()}
          {/* enableHandleData일 때의 기본 checkedButtons */}
          {!isEmpty(checkedItems) && checkedButtons.length > 0 && !selectionOptions?.actions && (
            <>{checkedButtons}</>
          )}
          {!isTrue(isSubCollection) && isTrue(addNew, true) && (
            <button
              className="rcm-button"
              data-variant="primary"
              onClick={() => {
                setOpenBaseLoading(true);
                router.push(`${path}/add`);
              }}
            >
              <IconPlus className="rcm-btn-icon" />
              신규 입력
            </button>
          )}
        </>
      )}
    </div>
  );
};
