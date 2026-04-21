import React, { ReactNode } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { FormField } from './abstract';
import { getInputRendererParameters } from '../helper/FieldRendererHelper';
import { RuleConditionValue, RuleFieldEntityForm } from './rule/Type';
import { RuleFieldView } from './rule/RuleFieldView';

export class RuleField extends FormField<RuleField> {
  entityForms: RuleFieldEntityForm[];

  constructor(name: string, order: number, ...entityForms: RuleFieldEntityForm[]) {
    super(name, order, 'custom');
    this.entityForms = entityForms;
  }

  withEntityForms(entityForms: RuleFieldEntityForm[]): this {
    this.entityForms = entityForms;
    return this;
  }

  protected createInstance(name: string, order: number): RuleField {
    return new RuleField(name, order, ...this.entityForms);
  }

  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null | undefined> {
    return (async () => {
      return Promise.resolve(
        <RuleFieldView
          {...await getInputRendererParameters(this, { ...params })}
          entityForms={this.entityForms}
          onSubmit={(value: Map<number, RuleConditionValue>) => {
            params.onChange(value);
          }}
        />,
      );
    })();
  }
}
