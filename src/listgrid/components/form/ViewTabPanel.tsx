'use client';

import { Tab } from '@headlessui/react';
import { ReactNode, useEffect, useState } from 'react';
import { ViewFieldGroup } from './ViewFieldGroup';
import { EntityFormManageable, TabIndexable } from './types/ViewEntityForm.types';
import { Session } from '../../auth/types';
import { useEntityFormTheme } from './context/EntityFormThemeContext';

interface ViewTabPanelProps extends TabIndexable, EntityFormManageable {
  id: string;
  readonly: boolean;
  subCollectionEntity?: boolean;
  session?: Session;
  createStepFields?: string[];
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>;
  /** MappedBy field name for hiding parent reference fields in SubCollection */
  hideMappedByFields?: string;
}

export const ViewTabPanel = ({
  id,
  tabIndex,
  entityForm,
  setEntityForm,
  readonly,
  subCollectionEntity,
  session,
  createStepFields,
  resetEntityForm,
  hideMappedByFields,
  ...props
}: ViewTabPanelProps) => {
  const { classNames, cn } = useEntityFormTheme();
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    setGroups([]);
    (async () => {
      const viewableFieldGroups = await entityForm.getViewableFieldGroups({
        tabId: id,
        createStepFields,
      });
      setGroups(viewableFieldGroups);
    })();
  }, [id, createStepFields?.join(','), entityForm]); // tabIndex 의존성 제거, createStepFields를 문자열로 변환하여 안정적인 비교

  // Tab.Group에서 자동으로 활성화/비활성화되므로 별도의 조건 체크 제거
  // Tab.Group automatically handles activation/deactivation, so remove separate condition check

  if (groups.length === 0) {
    return (
      <Tab.Panel className={classNames.tabPanel?.panel} unmount={false}>
        <div className={cn('p-4 text-gray-500 dark:text-gray-400', classNames.tabPanel?.empty)}>
          이 단계에서는 표시할 내용이 없습니다.
        </div>
      </Tab.Panel>
    );
  }

  return (
    <Tab.Panel className={classNames.tabPanel?.panel} unmount={false}>
      <div className={cn('pt-2 md:pt-3', classNames.tabPanel?.content)}>
        {(function () {
          const panels: ReactNode[] = [];
          groups.forEach((group, index) => {
            panels.push(
              <div key={`${group}-${index}-${createStepFields ? createStepFields?.join(',') : ''}`}>
                <ViewFieldGroup
                  tabId={id}
                  groupId={group}
                  key={index}
                  readonly={readonly}
                  {...(subCollectionEntity !== undefined ? { subCollectionEntity } : {})}
                  entityForm={entityForm}
                  {...(setEntityForm !== undefined ? { setEntityForm } : {})}
                  {...(session !== undefined ? { session } : {})}
                  {...(createStepFields !== undefined ? { createStepFields } : {})}
                  {...(resetEntityForm !== undefined ? { resetEntityForm } : {})}
                  {...(hideMappedByFields !== undefined ? { hideMappedByFields } : {})}
                />
              </div>,
            );
          });

          return panels;
        })()}
      </div>
    </Tab.Panel>
  );
};
