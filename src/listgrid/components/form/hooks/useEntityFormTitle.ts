import { EntityForm } from '../../../config/EntityForm';
import { defaultString, isBlank } from '../../../utils/StringUtil';
import { getTranslation } from '../../../utils/i18n';
import { ReactNode } from 'react';

/**
 * EntityForm의 타이틀을 동적으로 계산해 반환하는 커스텀 훅
 * @param entityForm - 기준 EntityForm
 * @param customTitle - 커스텀 타이틀(옵션)
 * @returns (form?: EntityForm) => Promise<ReactNode>
 */
export const useEntityFormTitle = ({
  entityForm,
  customTitle,
}: {
  entityForm: EntityForm;
  customTitle?: string;
}) => {
  const { t } = getTranslation();
  return async (form?: EntityForm): Promise<ReactNode> => {
    const f = form ?? entityForm;
    if (f.title?.view) {
      return await f.title.view(f);
    }
    let title: string = await f?.getTitle(defaultString(customTitle));
    if (isBlank(title)) {
      title = f.id === undefined ? '신규 입력' : '정보 조회';
    }
    if (f.title?.field) {
      if (f.title.field.includes('.')) {
        // manyToOne 필드의 값을 가져온 후 . 다음의 필드값을 가져온다.
        const [fieldName, subFieldName] = f.title.field.split('.');
        const fieldValue = await f.getValue(fieldName!);
        if (fieldValue) {
          const nameValue = fieldValue[subFieldName!];
          if (nameValue) {
            title = t(title) + ' > ' + nameValue;
          }
        }
      } else {
        const nameValue = await f.getValue(f.title.field);
        if (nameValue) {
          title = t(title) + ' > ' + nameValue;
        }
      }
    } else {
      const nameValue = await f.getValue('name');
      if (nameValue) {
        title = t(title) + ' > ' + nameValue;
      } else if (f.id) {
        title = t(title) + ' > ' + f.id;
      } else {
        title = t(title);
      }
    }
    return title;
  };
};
