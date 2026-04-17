/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
'use client'

import {FormField} from '../abstract';
import React, {ReactNode, useEffect, useState} from "react";
import {EntityForm} from '../../../config/EntityForm';
import {FieldRenderParameters} from '../../../config/EntityField';
import {useSession} from '../../../../auth';

interface RuleFieldRendererProps {
  field: FormField<any>;
  onChange: (value: any) => void;
}

export const RuleFieldRenderer = (props: RuleFieldRendererProps) => {

  const field = props.field;

  const [view, setView] = useState<ReactNode>();

  const session = useSession();


  useEffect(() => {

    (async () =>{

      const viewParams: FieldRenderParameters = {
        entityForm: new EntityForm('temp', ''),
        onChange: props.onChange,
        required: await field.isRequired({session})
      }
      setView(await field.render(viewParams));

    })();



  }, []);

  return <div>
    <div className={'flex items-center'}>
      {view}
    </div>
  </div>

}

