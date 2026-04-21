import { RuleBasedFieldsView } from './RuleBasedFieldView';
import React from 'react';
import {
  ResultByRuleCondition,
  RuleBasedFieldProps,
  RuleConditionValue,
  RuleFieldEntityForm,
} from './Type';

interface RuleFieldViewProps extends RuleBasedFieldProps {
  onSubmit: ResultByRuleCondition;
  entityForms: RuleFieldEntityForm[];
}

export const RuleFieldView = (props: RuleFieldViewProps) => {
  const value = getValue(props.value);

  function getValue(v: unknown) {
    if (v === undefined) {
      return undefined;
    }

    if (v instanceof Map) {
      return v;
    } else if (typeof v === 'object' && v !== null) {
      // 객체인 경우 Map으로 변환 시도
      const newMap = new Map<number, RuleConditionValue>();

      Object.entries(v).map(([key, value]) => {
        const ruleCondition = RuleConditionValue.create(value);
        newMap.set(ruleCondition.id, ruleCondition);
      });

      return newMap;
    } else {
      // Map이 아니거나 변환이 불가능한 경우 빈 Map으로 설정
      return undefined;
    }
  }

  return (
    <div className={'border rounded-md p-4'}>
      <RuleBasedFieldsView
        {...props}
        value={value}
        viewType={'field'}
        onSubmitField={props.onSubmit}
        onCancel={() => {}}
      />
    </div>
  );
};
