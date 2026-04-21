'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { Paper } from '../../../ui';
import { Modal } from '../../../ui';
import { ResultByCount, RuleBasedFieldProps, RuleFieldType } from './Type';
import { getConditionalReactNode, HelpTextType, LabelType } from '../../../config/Config';
import { RuleBasedFieldsView } from './RuleBasedFieldView';
import { EntityForm } from '../../../config/EntityForm';
import { useSession } from '../../../auth';

interface RuleBasedSelectorProps extends RuleBasedFieldProps {
  type: RuleFieldType;
  helpText?: HelpTextType;
  label?: LabelType;
  onSubmit?: ResultByCount;
  entityForm: EntityForm;
  apiUrl?: string;
}

export const RuleBasedSelector = ({ ...props }: RuleBasedSelectorProps) => {
  const entityForm = props.entityForm;

  const apiUrl = getApiUrl(props.apiUrl ?? entityForm.getUrl(), props.type, props.parentId ?? '');

  const [open, setOpen] = useState(false);

  const [label, setLabel] = useState<ReactNode>();
  const [helpText, setHelpText] = useState<ReactNode>();

  const session = useSession();

  /**
   * RuleBasedSelector 를 FormField 의 render 에서 사용할 수 있도록 label 과 helpText 를 맞춘다.
   */
  useEffect(() => {
    if (props.label === undefined) {
      if (props.fieldName !== undefined) {
        const label = entityForm.getLabel(props.fieldName!);
        setLabel(label);
      } else {
        setLabel(props.type === 'add' ? '검색 후 등록' : '검색 후 제거');
      }
    } else {
      //
      if (typeof props.label === 'boolean') {
        setLabel(props.type === 'add' ? '검색 후 등록' : '검색 후 제거');
      } else {
        setLabel(props.label);
      }
    }

    if (props.helpText === undefined) {
      if (props.fieldName !== undefined) {
        (async () => {
          const label = await entityForm.getHelpText(props.fieldName!);
          setHelpText(label);
        })();
      } else {
        setHelpText('');
      }
    } else {
      //
      (async () => {
        const helpText = await getConditionalReactNode(
          { entityForm, renderType: entityForm?.getRenderType(), session: session },
          props.helpText,
        );
        setHelpText(helpText);
      })();
    }
  }, []);

  return (
    <>
      <button
        className={'btn btn-outline-secondary h-[34px]'}
        onClick={() => {
          setOpen(true);
        }}
      >
        {label}
      </button>
      <Modal
        opened={open}
        size={'5xl'}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Paper>
          <RuleBasedFieldsView
            {...props}
            label={label}
            entityForms={[{ label: '', prefix: '', entityForm: entityForm }]}
            helpText={helpText}
            apiUrl={apiUrl}
            viewType={'selector'}
            onSubmitSelector={
              props.onSubmit !== undefined
                ? props.onSubmit
                : (count: number) => {
                    setOpen(false);
                    props.setNotifications?.([
                      `${count} 건의 데이터가 ${props.type === 'add' ? '등록' : '제거'} 되었습니다.`,
                    ]);
                    props.onRefresh?.();
                  }
            }
            onCancel={() => {
              setOpen(false);
            }}
          />
        </Paper>
      </Modal>
    </>
  );
};

function getApiUrl(apiUrl: string, type: 'add' | 'remove', parentId: string): string {
  return `${apiUrl}/${type}/${parentId}`;
}
