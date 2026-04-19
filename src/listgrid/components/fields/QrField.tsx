import { FormField } from './abstract';
import { ReactNode } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { EntityForm } from '../../config/EntityForm';
import QRCode from 'qrcode.react';
import { isBlank } from '../../utils/StringUtil';

export class QrField extends FormField<QrField> {
  findValue: (entityForm: EntityForm) => Promise<string>;

  constructor(name: string, order: number, findValue: (entityForm: EntityForm) => Promise<string>) {
    super(name, order, 'custom');
    this.findValue = findValue;
  }

  /**
   * QrField 핵심 렌더링 로직 (원본 render 로직 보존)
   */
  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null | undefined> {
    return (async () => {
      const value = await this.findValue(params.entityForm);

      if (isBlank(value)) {
        return null;
      }

      return <QrViewer value={value} />;
    })();
  }

  /**
   * QrField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): QrField {
    return new QrField(name, order, this.findValue);
  }
}

interface QrViewerProps {
  value: string;
}

export const QrViewer = (props: QrViewerProps) => {
  return (
    <div className={`p-2`}>
      <QRCode value={props.value} />
    </div>
  );
};
