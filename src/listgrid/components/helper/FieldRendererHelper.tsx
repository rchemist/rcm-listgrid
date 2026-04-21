import { ReactNode } from 'react';
import { EntityField, FieldRenderParameters } from '../../config/EntityField';
import { AbstractManyToOneField, FormField } from '../fields/abstract';
import { RenderType } from '../../config/Config';
// Removed ManyToOneField and UserField imports to fix circular dependency
import { isBlank } from '../../utils/StringUtil';
import { Tooltip } from '../../ui';
import { Link } from '../../router';
import { IconExternalLink } from '@tabler/icons-react';

export async function getInputRendererParameters<TForm extends object = any, TValue = any>(
  field: FormField<any, TValue, TForm>,
  params: FieldRenderParameters<TForm, TValue>,
) {
  return {
    ...params,
    value: await field.getDisplayValue(params.entityForm, params.entityForm.getRenderType()),
    name: field.getName(),
    label: field.getLabel(),
    attributes: field.attributes,
  };
}

export async function getManyToOneLink(
  renderType: RenderType,
  field?: EntityField,
): Promise<ReactNode> {
  if (
    field &&
    field instanceof AbstractManyToOneField &&
    !isBlank(field.config.entityForm.menuUrl)
  ) {
    const idName = await field.getMappedIdName(renderType);
    const menuUrl = `${field.config.entityForm.menuUrl}/${idName?.id ?? ''}`;
    const tooltip = `${idName?.name ?? field.getLabel()} 보기`;
    return (
      <Tooltip label={tooltip} color={'gray'}>
        <Link href={menuUrl!} target={'_blank'} className="rcm-m2o-external-link">
          <IconExternalLink className="rcm-icon" data-size="md" data-tone="muted" />
        </Link>
      </Tooltip>
    );
  }
  return null;
}
