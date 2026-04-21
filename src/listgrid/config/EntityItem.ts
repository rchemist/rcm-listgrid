import {
  HelpTextType,
  HiddenType,
  LabelType,
  ReadOnlyType,
  TooltipType,
  ViewPreset,
} from '../config/Config';
import { ReactNode } from 'react';
import { FieldInfoParameters } from '../config/EntityField';

export interface EntityItem {
  order: number; // 필드 표시 순서, 필요하다면 list 의 필드 순서를 별도로 지정할 수 있다.
  name: string; // 필드 이름 - 시스템에서 사용하는 이름으로, 하나의 엔티티 폼에서 필드는 반드시 유니크 해야 한다. equlas 비교를 해야 하기 때문에 가급적 영문/숫자를 이용한다.
  label?: LabelType | undefined; // 화면에 표시되는 필드의 label. i18n 을 자동 지원한다.
  helpText?: HelpTextType | undefined; // helpText, string 으로 지정된 경우에는 그냥 신규/수정 모두 동일한 메시지가 표시되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  hidden?: HiddenType | undefined; // 필드 표시 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  readonly?: ReadOnlyType | undefined; // 수정 불가 여부, boolean 으로 지정된 경우에는 그냥 신규/수정 모두 동일하게 처리되고, 그 외에는 상황에 맞게 분리돼 표시된다.
  hideLabel?: boolean | undefined; // 필드 렌더러에서 라벨을 표시하지 않고 싶다면 이 값을 true 로 한다.

  // // tab, fieldGroup 의 ID, 이 값은 EntityForm 이 initialize 될 때 자동으로 처리된다. 외부에서 입력할 필요가 없는 값이다.
  form?: { tabId: string; fieldGroupId: string } | undefined;

  // intentional: each implementation returns its concrete subtype (EntityField, EntityTab, etc.)
  clone(includeValue?: boolean): any;

  getTabId(): string;

  getFieldGroupId(): string;

  /**
   * 필드가 표시될 tab의 id 를 지정합니다.
   * 보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.
   * @param tabId
   */
  withTabId(tabId: string): this;

  /**
   * 필드가 표시될 fieldGroup 의 id 를 지정합니다.
   * 보통 이 메소드는 EntityForm#addFields 에서 처리되므로 별도로 사용할 필요가 없습니다.
   * @param fieldGroupId
   */
  withFieldGroupId(fieldGroupId: string): this;

  /**
   * Entity 의 상태(신규/수정)에 따라 readonly, hidden 을 ViewPreset 으로 지정해 사용할 수 있습니다.
   * @param type
   */
  withViewPreset(type: ViewPreset): this;

  /**
   * 필드 입력폼 하단에 출력될 helpText 를 지정할 수 있습니다.
   * @param helpText
   */
  withHelpText(helpText?: HelpTextType): this;

  /**
   * 필드 전체에 툴팁을 씌울 수 있다.
   * @param tooltip
   */
  withTooltip(tooltip?: TooltipType): this;

  /**
   * 필드의 visible 옵션을 설정할 수 있습니다.
   * @param hidden
   */
  withHidden(hidden?: HiddenType): this;

  /**
   * 필드 입력폼의 라벨에 표시될 내용을 설정할 수 있습니다.
   * @param label
   */
  withLabel(label?: LabelType): this;

  /**
   * 필드가 readonly 인지 여부를 설정할 수 있습니다.
   * @param readOnly
   */
  withReadOnly(readOnly?: ReadOnlyType): this;

  /**
   * 이 필드의 hideLabel 을 지정한다.
   * @param hideLabel
   */
  withHideLabel(hideLabel?: boolean): this;

  /**
   * 필드의 표시 순서를 설정합니다.
   * @param order
   */
  withOrder(order: number): this;

  getOrder(): number;

  getName(): string;

  getLabel(): LabelType;

  getHelpText(props: FieldInfoParameters): Promise<ReactNode>;

  isHidden(props: FieldInfoParameters): Promise<boolean>;

  isReadonly(props: FieldInfoParameters): Promise<boolean>;

  /**
   * 필드가 표시될 tabId 와 fieldGroupId 를 설정합니다.
   * withTabId, withFieldGroupId 를 한번에 지정하는 것과 같습니다.
   * @param form
   */
  withForm(form: { tabId: string; fieldGroupId: string }): this;
}
