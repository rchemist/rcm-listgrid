'use client';

'use client';

import { AbstractManyToOneField, FormField } from '../fields/abstract';
import React, { ReactNode, useCallback, useEffect, useId, useState } from 'react';
import { ViewFieldError } from './ui/ViewFieldError';
import { LabelType } from '../../config/Config';
import { EntityForm } from '../../config/EntityForm';
import { FieldError } from '../../config/EntityFormTypes';
import { ViewHelpText } from './ui/ViewHelpText';
import { FieldRenderParameters } from '../../config/EntityField';
import { Icon } from '@iconify/react';
import { EntityFormManageable } from './types/ViewEntityForm.types';
import { isTrue } from '../../utils/BooleanUtil';
import { isBlank } from '../../utils/StringUtil';
import { IconHelp } from '@tabler/icons-react';
import { Tooltip } from '../../ui';
import { Session } from '../../auth/types';
import { useLoadingStore } from '../../loading';
import { getTranslation } from '../../utils/i18n';
import { getManyToOneLink } from '../helper/FieldRendererHelper';
import { useEntityFormTheme } from './context/EntityFormThemeContext';
import { enqueueCommit } from './pending-commits';

/**
 * FieldRenderer component
 * - Renders a single FormField in EntityForm, including label, tooltip, help, error, and value view.
 * - Handles value change, validation, error display, and many-to-one link rendering.
 *
 * FieldRenderer 컴포넌트
 * - EntityForm의 단일 FormField를 렌더링합니다. (라벨, 툴팁, 도움말, 에러, 값 뷰 포함)
 * - 값 변경, 검증, 에러 표시, many-to-one 링크 렌더링을 처리합니다.
 *
 * @param props {FieldRendererProps} - 필드, EntityForm, 상태 setter 등
 * @returns {JSX.Element} - 렌더링 결과
 */
interface FieldRendererProps extends EntityFormManageable {
  field: FormField<any>; // 렌더링할 FormField
  subCollectionEntity?: boolean; // 서브콜렉션 여부
  session?: Session; // 세션 정보
  resetEntityForm?: (delay?: number, preserveState?: boolean) => Promise<void>; // EntityForm 리셋 함수
}

export const FieldRenderer = (props: FieldRendererProps) => {
  const { t } = getTranslation();
  const { classNames, cn, getFieldRenderer } = useEntityFormTheme();
  const entityForm = props.entityForm;
  const latestFormRef = React.useRef(entityForm);
  latestFormRef.current = entityForm;
  const setEntityForm = props.setEntityForm;
  const field = props.field;
  const subCollectionEntity = isTrue(props.subCollectionEntity, false);
  const { setOpenBaseLoading } = useLoadingStore();

  // Generate unique ID per component instance to prevent ID collision between parent and modal forms
  const instanceId = useId();

  // 필드 렌더링에 필요한 상태들
  // State for rendering the field
  const [version, setVersion] = React.useState<string>();
  const [view, setView] = useState<ReactNode>();
  const [errors, setErrors] = useState<string[]>([]);
  const [required, setRequired] = useState<boolean>(false);
  const [_readonly, setReadonly] = useState<boolean>();
  const [tooltip, setTooltip] = useState<ReactNode>('');
  const [helpText, setHelpText] = useState<ReactNode>('');
  const [_placeHolder, setPlaceHolder] = useState<string>('');
  const [manyToOneLink, setManyToOneLink] = useState<ReactNode>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  // 커스텀 렌더러용 현재 필드 값
  const [currentValue, setCurrentValue] = useState<any>();

  // 커스텀 필드 렌더러 확인
  const CustomFieldRenderer = getFieldRenderer(field.getName());

  // onChange 처리 공통 로직 — 커스텀 렌더러용(handleFieldChange)과 기본 뷰용(viewParams.onChange)이
  // 이 헬퍼를 공유한다. 실패 시 예외를 던져서 각 호출부의 catch 가 setErrors 로 사용자 피드백을
  // 보장하도록 한다. (기존에는 두 곳 모두 .catch 가 없어 validate()/getManyToOneLink() 가 던지면
  // unhandled rejection 이 되어 에러가 조용히 사라졌음 — P0-3)
  const applyFieldChange = useCallback(
    (value: any, propagation: boolean | undefined, updateCurrentValue: boolean) =>
      enqueueCommit(entityForm?.id, async () => {
        const fieldName = field.getName();
        const currentScroll = window.scrollY;

        setErrors([]);
        if (updateCurrentValue) {
          setCurrentValue(value);
        }

        const isPropagation = isTrue(propagation, true);

        let cloned: EntityForm = (latestFormRef.current ?? entityForm).clone(true);
        cloned.setValue(fieldName, value);
        cloned.clearAlertMessages(false);

        const updatedField = cloned.fields.get(fieldName);
        setDirty(updatedField?.isDirty() ?? false);

        const validationErrors: FieldError[] = await cloned.validate({
          fieldNames: [fieldName],
          ...(props.session !== undefined ? { session: props.session } : {}),
        });
        cloned.mergeError(fieldName, validationErrors);

        let changed = false;

        if (isPropagation) {
          if (cloned.onChanges && cloned.onChanges.length > 0) {
            for (const onChange of cloned.onChanges!) {
              try {
                cloned = await onChange(cloned, fieldName);
                if (isTrue(cloned.shouldReload)) {
                  changed = true;
                }
              } catch (e) {
                console.error(e);
              }
            }
          }
        }

        const manyToOneField = cloned.getField(fieldName);
        setManyToOneLink(await getManyToOneLink(cloned.getRenderType(), manyToOneField));

        if (changed || manyToOneField instanceof AbstractManyToOneField) {
          setEntityForm?.(cloned);
        } else {
          // Sprint 31c W.6 — React 19 setState 는 same reference 시 skip 함.
          // 기존 `entityForm.merge(cloned); setEntityForm(entityForm)` 는 같은
          // ref 를 setState 로 보내 re-render 가 생기지 않아 controlled input
          // 의 value 가 EntityForm 갱신 후에도 update 안 됨. cloned (새 ref)
          // 를 passing 하여 reconciliation 강제 + 값 동기화 보장.
          setEntityForm?.(cloned);
        }

        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - currentScroll) > 0) {
            setOpenBaseLoading(true);
            window.scrollTo({
              top: currentScroll,
              behavior: 'instant',
            });
            setTimeout(() => {
              setOpenBaseLoading(false);
            }, 50);
          }
        });
      }),
    [entityForm, setEntityForm, field, props.session, setOpenBaseLoading],
  );

  // 커스텀 렌더러용 onChange 핸들러
  const handleFieldChange = useCallback(
    (value: any, propagation?: boolean) => {
      (async () => {
        try {
          await applyFieldChange(value, propagation, true);
        } catch (e) {
          console.error(e);
          setErrors(['필드 값을 처리하는 중 오류가 발생했습니다.']);
        }
      })();
    },
    [applyFieldChange],
  );

  // 커스텀 렌더러용 onError 핸들러
  const handleFieldError = useCallback(
    (message: string) => {
      if (isBlank(message)) return;

      const newErrors: string[] = [message];
      setErrors(newErrors);

      const errors: FieldError[] = entityForm.errors ? [...entityForm.errors] : [];
      errors.push({
        name: field.name,
        label: field.label,
        errors: newErrors,
      });

      const cloned = entityForm.clone(true).withErrors(errors);
      setEntityForm?.(cloned);
    },
    [entityForm, setEntityForm, field],
  );

  // 커스텀 렌더러용 clearError 핸들러
  const handleClearError = useCallback(() => {
    setErrors([]);
  }, []);

  const name = field.getName();
  const label = field.getLabel();
  const showTooltip = !isBlank(tooltip);
  const hideLabel = isTrue(field.hideLabel);

  useEffect(() => {
    if (entityForm) {
      setVersion(entityForm.version);
      const fieldInstance = entityForm.fields.get(name);
      setDirty(fieldInstance?.isDirty() ?? false);
      // 커스텀 렌더러용 현재 값 설정
      setCurrentValue(entityForm.getValue(name));

      (async () => {
        // 필드 에러, 필수, 읽기전용, 툴팁, 도움말, placeholder 등 비동기 조회 및 상태 반영
        // Fetch field errors, required, readonly, tooltip, helpText, placeholder, etc. asynchronously
        const messages = new Set<string>();

        const fieldErrors = entityForm?.errors;

        if (fieldErrors && fieldErrors.length > 0) {
          fieldErrors.forEach((error) => {
            if (error.name === field.getName() && error.errors.length > 0) {
              error.errors.forEach((error) => {
                messages.add(error);
              });
            }
          });
        }

        setErrors([...messages]);

        const fieldInfoParams: { entityForm: EntityForm; session?: Session } = {
          entityForm,
          ...(props.session !== undefined ? { session: props.session } : {}),
        };

        const required = await field.isRequired(fieldInfoParams);
        const readonly = await field.isReadonly(fieldInfoParams);

        setRequired(required);
        setReadonly(readonly);

        const tooltip = await field.getTooltip(fieldInfoParams);
        setTooltip(tooltip);

        const helpText = await field.getHelpText(fieldInfoParams);
        setHelpText(helpText);

        const placeHolder = await field.getPlaceHolder(fieldInfoParams);
        setPlaceHolder(placeHolder);

        // 필드 렌더링 파라미터 구성 및 view 생성
        // Build field render parameters and generate view
        const viewParams: FieldRenderParameters = {
          entityForm: entityForm,
          ...(props.session !== undefined ? { session: props.session } : {}),
          subCollectionEntity: subCollectionEntity,
          updateEntityForm: async (updater) => {
            // EntityForm을 업데이트하고 상태를 반영
            const updatedEntityForm = await updater(entityForm.clone(true));
            setEntityForm?.(updatedEntityForm);
          },
          ...(props.resetEntityForm !== undefined
            ? { resetEntityForm: props.resetEntityForm }
            : {}),
          onChange: (value, propagation) => {
            (async () => {
              try {
                await applyFieldChange(value, propagation, false);
              } catch (e) {
                console.error(e);
                setErrors(['필드 값을 처리하는 중 오류가 발생했습니다.']);
              }
            })();
          },
          onError: (message: string) => {
            // 필드 에러 발생 시 에러 상태 및 EntityForm 에러 갱신
            // On field error: update error state and EntityForm errors
            if (isBlank(message)) {
              return;
            }

            const newErrors: string[] = [];
            newErrors.push(message);
            setErrors(newErrors);

            const errors: FieldError[] = [];
            if (entityForm.errors) {
              errors.push(...entityForm.errors);
            }
            errors.push({
              name: field.name,
              label: field.label,
              errors: newErrors,
            });

            const cloned: EntityForm = entityForm.clone(true).withErrors(errors);
            setEntityForm?.(cloned);
          },
          clearError: () => {
            // 에러 상태 초기화
            // Clear error state
            setErrors([]);
          },
          required: required,
          readonly: readonly,
          placeHolder: placeHolder,
          helpText: helpText,
        };

        setView(await field.view(viewParams));
      })();
    }
  }, [entityForm, setEntityForm]);

  useEffect(() => {
    (async () => {
      // manyToOneLink(상세보기 등) 렌더링용 상태 갱신
      // Update manyToOneLink (for detail view, etc.)
      setManyToOneLink(await getManyToOneLink(entityForm.getRenderType(), field));
    })();
  }, []);

  return (
    <div
      id={`field-${instanceId}-${name}`}
      data-field-name={name}
      className={classNames.field?.container}
    >
      <div
        id={`field-${instanceId}-${name}-${version}`}
        className={cn(
          `rcm-field-label-wrapper ${showTooltip ? 'rcm-field-label-wrapper-with-tooltip' : ''}`,
          classNames.field?.labelWrapper,
        )}
      >
        <div className="rcm-field-label-row">
          {/* 라벨 렌더링: 숨김 설정이 아니면 표시 */}
          {/* Render label: show unless hideLabel is true */}
          {!hideLabel && (
            <label className={cn('rcm-field-label', classNames.field?.label)}>
              {viewLabel(label)}
            </label>
          )}
          {/* manyToOne 링크(상세보기 등) 렌더링 */}
          {/* Render manyToOne link (for detail view, etc.) */}
          {manyToOneLink}
          {/* 필수값 아이콘 */}
          {/* Required icon */}
          {required && (
            <Tooltip label={'필수값'} color={'red'} withArrow={true}>
              <div className="rcm-field-icon-wrap">
                <Icon
                  icon="healthicons:star-small"
                  className={cn(
                    'rcm-field-icon rcm-field-icon-required',
                    classNames.field?.requiredIcon,
                  )}
                />
              </div>
            </Tooltip>
          )}
          {/* 수정됨(Dirty) 아이콘 */}
          {/* Dirty icon */}
          {dirty && (
            <Tooltip
              label={'수정됨'}
              color={'yellow'}
              withArrow={true}
              key={`tooltip-${name}-${version}-dirty`}
            >
              <div className="rcm-field-icon-wrap">
                <Icon
                  icon="healthicons:star-small-outline"
                  className={cn('rcm-field-icon rcm-field-icon-dirty', classNames.field?.dirtyIcon)}
                />
              </div>
            </Tooltip>
          )}
        </div>
        {/* 툴팁 아이콘: tooltip이 있을 때만 표시 */}
        {/* Tooltip icon: only show if tooltip exists */}
        {showTooltip && (
          <div className="rcm-row">
            <Tooltip label={tooltip} color={'gray'} withArrow={true} position={'top-end'}>
              <div className={cn('rcm-field-tooltip-icon', classNames.field?.tooltipIcon)}>
                <IconHelp className="rcm-field-icon" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
      {/* 필드 값 뷰 렌더링 */}
      {/* Render field value view */}
      {/* aria-label injection — label 이 string 이고 input view 가 valid element 일 때
          aria-label={label} 을 cloneElement 로 주입. 시각 변경 0 +
          Playwright getByLabel + 스크린리더 a11y compliance. */}
      <div className={cn('rcm-field-value', classNames.field?.valueContainer)}>
        {CustomFieldRenderer ? (
          <CustomFieldRenderer
            field={field}
            entityForm={entityForm}
            {...(setEntityForm !== undefined ? { setEntityForm } : {})}
            value={currentValue}
            onChange={handleFieldChange}
            onError={handleFieldError}
            clearError={handleClearError}
            required={required}
            readonly={_readonly ?? false}
            {...(props.session !== undefined ? { session: props.session } : {})}
            helpText={helpText}
            placeholder={_placeHolder}
            subCollectionEntity={subCollectionEntity}
            {...(props.resetEntityForm !== undefined
              ? { resetEntityForm: props.resetEntityForm }
              : {})}
          />
        ) : React.isValidElement(view) && typeof label === 'string' && !hideLabel ? (
          React.cloneElement(view as React.ReactElement<Record<string, unknown>>, {
            'aria-label':
              (view.props as Record<string, unknown> | undefined)?.['aria-label'] ?? label,
          })
        ) : (
          view
        )}
      </div>
      {/* 필드 에러 메시지 렌더링 */}
      {/* Render field error messages */}
      <ViewFieldError errors={errors} />
      {/* 도움말 텍스트 렌더링 */}
      {/* Render help text */}
      <ViewHelpText helpText={helpText}></ViewHelpText>
    </div>
  );

  /**
   * viewLabel
   * - 라벨이 string이면 번역, 아니면 그대로 반환
   * - If label is string, translate; otherwise, return as is
   */
  function viewLabel(label: LabelType) {
    if (typeof label === 'string') {
      return t(label);
    }
    return label;
  }
};
