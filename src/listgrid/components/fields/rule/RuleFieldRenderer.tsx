'use client';

import { FormField } from '../abstract';
import React, { ReactNode, useEffect, useState } from 'react';
import { EntityForm } from '../../../config/EntityForm';
import { FieldRenderParameters } from '../../../config/EntityField';
import { useSession } from '../../../auth';

interface RuleFieldRendererProps {
  field: FormField<any>;
  onChange: (value: any) => void;
}

export const RuleFieldRenderer = (props: RuleFieldRendererProps) => {
  const field = props.field;

  const [view, setView] = useState<ReactNode>();

  const session = useSession();

  useEffect(() => {
    (async () => {
      const viewParams: FieldRenderParameters = {
        entityForm: new EntityForm('temp', ''),
        onChange: props.onChange,
        required: await field.isRequired({ session }),
      };
      setView(await field.render(viewParams));
    })();
  }, []);

  return (
    <div>
      <div className={'flex items-center'}>{view}</div>
    </div>
  );
};
