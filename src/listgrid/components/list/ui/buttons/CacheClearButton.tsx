import { EntityForm } from '../../../../config/EntityForm';
import { showConfirm } from '../../../../message';
import { isTrue } from '../../../../utils/BooleanUtil';
import { getExternalApiData } from '../../../../misc';
import { getRuntimeConfig } from '../../../../config/RuntimeConfig';

interface CacheClearButtonProps {
  entityForm: EntityForm;
  setNotifications: (notifications: string[]) => void;
  setErrors: (errors: string[]) => void;
  onRefresh: () => void;
}

const cacheControl = isTrue(getRuntimeConfig().cacheControl, false);

export const CacheClearButton: React.FC<CacheClearButtonProps> = ({
  entityForm,
  setNotifications,
  setErrors,
  onRefresh,
}) => {
  if (!cacheControl) {
    return null;
  }

  const handleCacheDelete = () => {
    showConfirm({
      title: '서버의 데이터 캐시를 제거하시겠습니까?',
      message: '캐시 정보를 제거하고 최신의 데이터를 DB에서 새로 FETCH 할 수 있습니다.',
      confirmButtonText: '캐시 삭제하기',
      cancelButtonText: '취소',
      onConfirm: async () => {
        const response = await getExternalApiData({
          url: `${entityForm.getUrl()}/clear-cache`,
          method: 'POST',
        });

        if (response) {
          setNotifications(['캐시가 정상적으로 삭제 되었습니다.']);
          setErrors([]);
          onRefresh();
        } else {
          setNotifications([]);
          setErrors(['캐시 삭제 중 오류가 발생했습니다.']);
        }
      },
    });
  };

  return (
    <button
      type={'button'}
      className="rcm-button"
      data-variant="outline"
      onClick={handleCacheDelete}
    >
      캐시 삭제
    </button>
  );
};
