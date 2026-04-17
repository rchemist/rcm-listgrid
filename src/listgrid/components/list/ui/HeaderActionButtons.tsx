import {Tooltip} from "@gjcu/ui/elements/tooltip/Tooltip";
import {useLoadingStore} from "@gjcu/ui/layout/BaseLoading";
import {isTrue} from '../../../utils/BooleanUtil';
import {IconDownload, IconPlus, IconTrash, IconUpload} from "@tabler/icons-react";
import {ReactNode} from "react";
import {ListGridHeaderProps} from "../types/ListGridHeader.types";
import {CacheClearButton} from "./buttons/CacheClearButton";
import {isEmpty} from "../../../utils";

export const HeaderActionButtons: React.FC<ListGridHeaderProps & { headerButtons: ReactNode[], checkedButtons: ReactNode[] } & { setOpenDownload: (val: boolean) => void, setOpenUpload: (val: boolean) => void, neverDelete?: boolean }> = (props) => {
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
        <div className="flex items-center justify-start space-x-2 whitespace-nowrap">
            {headerButtons}
            {supportPriority && !isSubCollection && (
                <Tooltip label="리스트 각 행의 맨 좌측 열을 드래그해 우선순위를 변경할 수 있습니다">
                    <button type="button" className="btn btn-primary" onClick={setManagePriority}>
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
                <button type="button" className="btn btn-primary" onClick={() => setOpenDownload(true)}>
                    <IconDownload className="mb-0.5 h-3.5 w-3.5 mr-1" />
                    다운로드
                </button>
            )}
            {!isSubCollection && !readonly && isTrue(dataTransferConfig?.isSupportImport()) && (
                <button type="button" className="btn btn-primary" onClick={() => setOpenUpload(true)}>
                    <IconUpload className="mb-0.5 h-3.5 w-3.5 mr-1" />
                    업로드
                </button>
            )}
            {/* selection.actions 버튼들 - actions가 명시적으로 설정된 경우 항상 표시 */}
            {!isEmpty(checkedItems) && checkedButtons.length > 0 && selectionOptions?.actions && (
                <>{checkedButtons}</>
            )}

            {enableHandleData && (
                <>
                    {!isSubCollection && activeTrashIcon && (() => {
                        const deleteButton = selectionOptions?.deleteButton;
                        const isDeleteButtonObject = deleteButton && typeof deleteButton === 'object';

                        return (
                            <button
                                type="button"
                                className={isDeleteButtonObject ? deleteButton.className || "btn btn-outline-danger w-full text-danger hover:!bg-danger-light hover:!text-danger" : "btn btn-outline-danger w-full text-danger hover:!bg-danger-light hover:!text-danger"}
                                onClick={async () => {
                                    // 삭제 확인 메시지
                                    if (isDeleteButtonObject && deleteButton.confirmMessage) {
                                        const message = typeof deleteButton.confirmMessage === 'function'
                                            ? deleteButton.confirmMessage(checkedItems || [])
                                            : deleteButton.confirmMessage;
                                        if (!confirm(message)) return;
                                    }

                                    deleteItems();
                                }}
                            >
                                {isDeleteButtonObject && deleteButton.icon ? deleteButton.icon : <IconTrash className="mb-0.5 h-3.5 w-3.5 mr-1" />}
                                {isDeleteButtonObject && deleteButton.label
                                    ? (typeof deleteButton.label === 'function'
                                        ? deleteButton.label(checkedItems || [])
                                        : deleteButton.label)
                                    : (isTrue(neverDelete) ? "사용 중지" : "선택 삭제")}
                            </button>
                        );
                    })()}
                    {/* enableHandleData일 때의 기본 checkedButtons */}
                    {!isEmpty(checkedItems) && checkedButtons.length > 0 && !selectionOptions?.actions && (
                        <>{checkedButtons}</>
                    )}
                    {!isTrue(isSubCollection) && isTrue(addNew, true) && (
                        <button className="btn btn-primary" onClick={() => {
                            setOpenBaseLoading(true);
                            router.push(`${path}/add`);
                        }}>
                            <div className="flex items-center">
                                <IconPlus className="mb-0.5 h-3.5 w-3.5 mr-1" />
                                신규 입력
                            </div>
                        </button>
                    )}
                </>
            )}
        </div>
    );
};