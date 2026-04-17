'use client';

/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
"use client";

import {AbstractManyToOneField, FormField} from '../fields/abstract';
import React, {ReactNode, useCallback, useEffect, useId, useState} from "react";
import {ViewFieldError} from './ui/ViewFieldError';
import {LabelType} from '../../config/Config';
import {EntityForm} from '../../config/EntityForm';
import {FieldError} from '../../config/EntityFormTypes';
import {ViewHelpText} from './ui/ViewHelpText';
import {FieldRenderParameters} from '../../config/EntityField';
import {Icon} from "@iconify/react";
import {EntityFormManageable} from './types/ViewEntityForm.types';
import {isTrue} from '../../utils/BooleanUtil';
import {isBlank} from '../../utils/StringUtil';
import {IconHelp} from "@tabler/icons-react";
import {Tooltip} from "../../ui";
import {Session} from '../../auth/types';
import {useLoadingStore} from "../../loading";
import {getTranslation} from "../../utils/i18n";
import {getManyToOneLink} from "../helper/FieldRendererHelper";
import {useEntityFormTheme} from "./context/EntityFormThemeContext";

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
  const [tooltip, setTooltip] = useState<ReactNode>("");
  const [helpText, setHelpText] = useState<ReactNode>("");
  const [_placeHolder, setPlaceHolder] = useState<string>("");
  const [manyToOneLink, setManyToOneLink] = useState<ReactNode>(null);
  const [dirty, setDirty] = useState<boolean>(false);
  // 커스텀 렌더러용 현재 필드 값
  const [currentValue, setCurrentValue] = useState<any>();

  // 커스텀 필드 렌더러 확인
  const CustomFieldRenderer = getFieldRenderer(field.getName());

  // 커스텀 렌더러용 onChange 핸들러
  const handleFieldChange = useCallback((value: any, propagation?: boolean) => {
    (async () => {
      const fieldName = field.getName();
      const currentScroll = window.scrollY;

      console.log(`[DEBUG FieldRenderer handleFieldChange] START field=${fieldName}, value=`, value);

      setErrors([]);
      setCurrentValue(value);

      const isPropagation = isTrue(propagation, true);

      let cloned: EntityForm = entityForm.clone(true);
      cloned.setValue(fieldName, value);
      cloned.clearAlertMessages(false);

      const updatedField = cloned.fields.get(fieldName);
      setDirty(updatedField?.isDirty() ?? false);

      const validationErrors: FieldError[] = await cloned.validate({
        fieldNames: [fieldName],
        session: props.session,
      });
      cloned.mergeError(fieldName, validationErrors);

      let changed = false;

      if (isPropagation) {
        if (cloned.onChanges && cloned.onChanges.length > 0) {
          console.log(`[DEBUG FieldRenderer handleFieldChange] onChanges count=${cloned.onChanges.length}`);
          for (const onChange of cloned.onChanges!) {
            try {
              cloned = await onChange(cloned, fieldName);
              console.log(`[DEBUG FieldRenderer handleFieldChange] after onChange: shouldReload=${cloned.shouldReload}`);
              if (isTrue(cloned.shouldReload)) {
                changed = true;
              }
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          console.log(`[DEBUG FieldRenderer handleFieldChange] NO onChanges registered`);
        }
      }

      console.log(`[DEBUG FieldRenderer handleFieldChange] END field=${fieldName}, changed=${changed}`);

      const manyToOneField = cloned.getField(fieldName);
      setManyToOneLink(
        await getManyToOneLink(cloned.getRenderType(), manyToOneField)
      );

      if (changed || manyToOneField instanceof AbstractManyToOneField) {
        console.log(`[DEBUG FieldRenderer handleFieldChange] setEntityForm with NEW cloned`);
        setEntityForm?.(cloned);
      } else {
        console.log(`[DEBUG FieldRenderer handleFieldChange] setEntityForm with MERGED original`);
        entityForm.merge(cloned);
        setEntityForm?.(entityForm);
      }

      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - currentScroll) > 0) {
          setOpenBaseLoading(true);
          window.scrollTo({
            top: currentScroll,
            behavior: "instant",
          });
          setTimeout(() => {
            setOpenBaseLoading(false);
          }, 50);
        }
      });
    })();
  }, [entityForm, setEntityForm, field, props.session, setOpenBaseLoading]);

  // 커스텀 렌더러용 onError 핸들러
  const handleFieldError = useCallback((message: string) => {
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
  }, [entityForm, setEntityForm, field]);

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

        const required = await field.isRequired({
          entityForm,
          session: props.session,
        });
        const readonly = await field.isReadonly({
          entityForm,
          session: props.session,
        });

        setRequired(required);
        setReadonly(readonly);

        const tooltip = await field.getTooltip({
          entityForm,
          session: props.session,
        });
        setTooltip(tooltip);

        const helpText = await field.getHelpText({
          entityForm,
          session: props.session,
        });
        setHelpText(helpText);

        const placeHolder = await field.getPlaceHolder({
          entityForm,
          session: props.session,
        });
        setPlaceHolder(placeHolder);

        // 필드 렌더링 파라미터 구성 및 view 생성
        // Build field render parameters and generate view
        const viewParams: FieldRenderParameters = {
          entityForm: entityForm,
          session: props.session,
          subCollectionEntity: subCollectionEntity,
          updateEntityForm: async (updater) => {
            // EntityForm을 업데이트하고 상태를 반영
            const updatedEntityForm = await updater(entityForm.clone(true));
            setEntityForm?.(updatedEntityForm);
          },
          resetEntityForm: props.resetEntityForm,
          onChange: (value, propagation) => {
            (async () => {
              // 값 변경 시 에러 초기화, 값 반영, 검증, onChanges 콜백, manyToOneLink 갱신 등 처리
              // On value change: clear errors, update value, validate, run onChanges, update manyToOneLink, etc.
              const name = field.getName();
              const currentScroll = window.scrollY; // 현재 스크롤 위치 저장

              setErrors([]);

              const isPropagation = isTrue(propagation, true);

              let cloned: EntityForm = entityForm.clone(true);
              cloned.setValue(name, value);
              
              // persistent가 false인 alert 메시지들을 제거
              cloned.clearAlertMessages(false);

              // dirty 상태 즉시 계산 및 업데이트
              const updatedField = cloned.fields.get(name);
              setDirty(updatedField?.isDirty() ?? false);

              // 현재 value 에 대해서만 다시 error 검사하기
              // Validate only the current value
              const errors: FieldError[] = await cloned.validate({
                fieldNames: [name],
                session: props.session,
              });
              cloned.mergeError(name, errors);

              let changed = false;

              console.log(`[DEBUG FieldRenderer] onChange START field=${name}, value=`, value, 'isPropagation=', isPropagation);

              if (isPropagation) {
                if (cloned.onChanges && cloned.onChanges.length > 0) {
                  console.log(`[DEBUG FieldRenderer] onChanges count=${cloned.onChanges.length}`);
                  for (const onChange of cloned.onChanges!) {
                    try {
                      cloned = await onChange(cloned, name);
                      console.log(`[DEBUG FieldRenderer] after onChange callback: shouldReload=${cloned.shouldReload}`);
                      if (isTrue(cloned.shouldReload)) {
                        changed = true;
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }
                } else {
                  console.log(`[DEBUG FieldRenderer] NO onChanges registered on cloned entityForm`);
                }
              }

              console.log(`[DEBUG FieldRenderer] onChange END field=${name}, changed=${changed}, shouldReload=${cloned.shouldReload}`);

              const manyToOneField = cloned.getField(name);
              setManyToOneLink(
                await getManyToOneLink(cloned.getRenderType(), manyToOneField)
              );

              if (changed || manyToOneField instanceof AbstractManyToOneField) {
                console.log(`[DEBUG FieldRenderer] setEntityForm with NEW cloned (changed=${changed}, isManyToOne=${manyToOneField instanceof AbstractManyToOneField})`);
                setEntityForm?.(cloned);
              } else {
                console.log(`[DEBUG FieldRenderer] setEntityForm with MERGED original`);
                entityForm.merge(cloned);
                setEntityForm?.(entityForm);
              }


              // entityForm 갱신으로 스크롤에 변화가 생겼다면 해당 위치로 스크롤을 자동 이동하는 구문
              // If entityForm update changes scroll, auto-scroll to previous position
              requestAnimationFrame(() => {
                if (Math.abs(window.scrollY - currentScroll) > 0) {
                  setOpenBaseLoading(true);
                  window.scrollTo({
                    top: currentScroll,
                    behavior: "instant",
                  });

                  setTimeout(() => {
                    setOpenBaseLoading(false);
                  }, 50);
                }
              });
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

            const cloned: EntityForm = entityForm
              .clone(true)
              .withErrors(errors);
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
      setManyToOneLink(
        await getManyToOneLink(entityForm.getRenderType(), field)
      );
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
        className={cn(`flex items-center ${showTooltip ? "justify-between" : ""} -mb-0.5`, classNames.field?.labelWrapper)}
      >
        <div className={"flex items-center"}>
          {/* 라벨 렌더링: 숨김 설정이 아니면 표시 */}
          {/* Render label: show unless hideLabel is true */}
          {!hideLabel && (
            <label className={cn("text-gray-500 dark:text-gray-400 text-xs md:text-sm", classNames.field?.label)}>
              {viewLabel(label)}
            </label>
          )}
          {/* manyToOne 링크(상세보기 등) 렌더링 */}
          {/* Render manyToOne link (for detail view, etc.) */}
          {manyToOneLink}
          {/* 필수값 아이콘 */}
          {/* Required icon */}
          {required && (
            <Tooltip label={"필수값"} color={"red"} withArrow={true}>
              <div className={"mb-0.5 md:mb-1"}>
                <Icon
                  icon="healthicons:star-small"
                  className={cn("cursor-help text-red-600 w-2.5 h-2.5 md:w-3 md:h-3", classNames.field?.requiredIcon)}
                />
              </div>
            </Tooltip>
          )}
          {/* 수정됨(Dirty) 아이콘 */}
          {/* Dirty icon */}
          {dirty && (
            <Tooltip label={"수정됨"} color={"yellow"} withArrow={true} key={`tooltip-${name}-${version}-dirty`}>
              <div className={"mb-0.5 md:mb-1"}>
                <Icon
                  icon="healthicons:star-small-outline"
                  className={cn("cursor-help text-yellow-600 w-2.5 h-2.5 md:w-3 md:h-3", classNames.field?.dirtyIcon)}
                />
              </div>
            </Tooltip>
          )}
        </div>
        {/* 툴팁 아이콘: tooltip이 있을 때만 표시 */}
        {/* Tooltip icon: only show if tooltip exists */}
        {showTooltip && (
          <div className={"flex items-center"}>
            <Tooltip
              label={tooltip}
              color={"gray"}
              withArrow={true}
              position={"top-end"}
            >
              <div className={cn("text-[11px] text-white-dark", classNames.field?.tooltipIcon)}>
                <IconHelp className={"h-2.5 w-2.5 md:h-3 md:w-3"} />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
      {/* 필드 값 뷰 렌더링 */}
      {/* Render field value view */}
      <div className={cn("max-w-full text-wrap", classNames.field?.valueContainer)}>
        {CustomFieldRenderer ? (
          <CustomFieldRenderer
            field={field}
            entityForm={entityForm}
            setEntityForm={setEntityForm}
            value={currentValue}
            onChange={handleFieldChange}
            onError={handleFieldError}
            clearError={handleClearError}
            required={required}
            readonly={_readonly ?? false}
            session={props.session}
            helpText={helpText}
            placeholder={_placeHolder}
            subCollectionEntity={subCollectionEntity}
            resetEntityForm={props.resetEntityForm}
          />
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
    if (typeof label === "string") {
      return t(label);
    }
    return label;
  }
};
