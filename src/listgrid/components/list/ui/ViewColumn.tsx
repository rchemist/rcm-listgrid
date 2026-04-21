'use client';
import { getAlignClassName } from '../../../common/func';
import { isTrue } from '../../../utils/BooleanUtil';
import { ReactNode, useEffect, useState } from 'react';
import { RowItemProps } from '../types/RowItem.types';
import { useListGridTheme } from '../context/ListGridThemeContext';

export const ViewColumn = ({
  fields,
  item,
  index,
  router,
  path,
  entityForm,
  viewFields,
  viewMode,
  onSelect,
  clickAccordion,
}: RowItemProps) => {
  const [views, setViews] = useState<ReactNode[] | undefined>();
  const { classNames: themeClasses } = useListGridTheme();

  const viewUrl = path + '/' + item.id;

  // 테마에서 데이터 셀 클래스 가져오기
  const dataCellClass = themeClasses.cell?.dataCell ?? '';
  const baseCellClass = themeClasses.cell?.cell ?? '';

  useEffect(() => {
    (async () => {
      const views: ReactNode[] = [];
      for (const field of fields) {
        if (viewFields.length === 0 || viewFields.includes(field.getName())) {
          const viewListResult = await field.viewListItem({
            entityForm,
            item,
            router,
            viewUrl,
          });

          const linkOnCell = isTrue(viewListResult.linkOnCell, true);

          const tdIndex = fields.indexOf(field);
          const alignClassName = getAlignClassName(field.getListFieldAlignType());

          views.push(
            <td
              className={`${baseCellClass} ${dataCellClass} ${alignClassName} whitespace-nowrap ${
                linkOnCell ? 'cursor-pointer' : ''
              }`}
              key={`td_${index}_${tdIndex}`}
              onClick={() => {
                if (linkOnCell) {
                  if (clickAccordion !== undefined) {
                    clickAccordion();
                  } else {
                    if (onSelect !== undefined) {
                      onSelect(item);
                    } else {
                      if (viewMode === 'page') {
                        router.push(viewUrl);
                      } else {
                        window.open(viewUrl, `${item.id}`);
                      }
                    }
                  }
                }
              }}
            >
              {viewListResult.result}
            </td>,
          );
        }
      }

      setViews(views);
    })();
  }, [viewFields]);

  if (views === undefined) return null;

  return <>{views}</>;
};
