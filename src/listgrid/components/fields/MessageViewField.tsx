import { ReactNode } from 'react';
import { FieldRenderParameters } from '../../config/EntityField';
import { FormField, FormFieldProps } from './abstract';

interface MessageViewFieldProps extends FormFieldProps {
  message: ReactNode;
}

export class MessageViewField extends FormField<MessageViewField> {
  message: ReactNode;

  constructor(name: string, order: number, message: ReactNode) {
    super(name, order, 'custom');
    this.readonly = true;
    this.hideLabel = true;
    this.message = message;
  }

  /**
   * MessageViewField 핵심 렌더링 로직
   */
  protected renderInstance(params: FieldRenderParameters): Promise<ReactNode | null> {
    return (async () => {
      return <div>{this.message}</div>;
    })();
  }

  /**
   * MessageViewField 인스턴스 생성
   */
  protected createInstance(name: string, order: number): MessageViewField {
    return new MessageViewField(name, order, this.message);
  }

  static create(props: MessageViewFieldProps): MessageViewField {
    return new MessageViewField(props.name, props.order, props.message).copyFields(props, true);
  }
}
