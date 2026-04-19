import { Tooltip } from '../../../../ui';
import { EntityForm } from '../../../../config/EntityForm';
import { showConfirm } from '../../../../message';
import { getExternalApiData } from '../../../../misc';

export interface PriorityButtonsProps {
  managePriority: boolean;
  setManagePriority: (value: boolean) => void;
  setParentManagePriority: () => void;
  rows?: any[];
  entityForm: EntityForm;
  setNotifications: (notifications: string[]) => void;
  setErrors: (errors: string[]) => void;
}

export const PriorityButtons: React.FC<PriorityButtonsProps> = ({
  managePriority,
  setManagePriority,
  setParentManagePriority,
  rows,
  entityForm,
  setNotifications,
  setErrors,
}) => {
  const handlePriorityToggle = () => {
    if (managePriority) {
      showConfirm({
        title: '우선순위 변경을 완료하시겠습니까?',
        message: '우선순위 변경을 완료하면 변경된 우선순위가 저장되어 목록에 반영됩니다.',
        confirmButtonText: '우선순위 변경 완료',
        cancelButtonText: '취소',
        onConfirm: async () => {
          const priorities = new Map<string, number>();
          rows?.forEach((row, index) => {
            priorities.set(row.id, index + 1);
          });

          const response = await getExternalApiData({
            url: `${entityForm.getUrl()}/priority`,
            method: 'PUT',
            formData: {
              priorities: Object.fromEntries(priorities),
            },
          });

          if (response) {
            setNotifications(['우선순위 변경이 완료되었습니다.']);
            setManagePriority(false);
            setParentManagePriority();
          } else {
            setNotifications([]);
            setErrors(['우선순위 변경 중 오류가 발생했습니다.']);
          }
        },
      });
    } else {
      setParentManagePriority();
      setManagePriority(true);
    }
  };

  const handleCancelPriorityChange = () => {
    setParentManagePriority();
    setManagePriority(false);
  };

  return (
    <div className="rcm-row">
      <Tooltip
        label={
          managePriority
            ? '리스트에서 우선순위를 변경한 후 버튼을 누르면 변경된 우선순위가 저장되어 목록에 반영됩니다.'
            : '리스트 각 행의 맨 좌측 열을 드래그해 우선순위를 변경할 수 있습니다'
        }
      >
        <button
          type={'button'}
          className="rcm-button"
          data-variant={managePriority ? 'primary' : 'outline'}
          onClick={handlePriorityToggle}
        >
          {managePriority ? '우선순위 변경 완료' : '우선순위 변경'}
        </button>
      </Tooltip>
      {managePriority && (
        <button
          type={'button'}
          className={'btn btn-outline-danger'}
          onClick={handleCancelPriorityChange}
        >
          우선순위 변경 취소
        </button>
      )}
    </div>
  );
};
