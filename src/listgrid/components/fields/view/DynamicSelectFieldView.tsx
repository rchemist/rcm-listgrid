/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */
"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {SelectOption} from "../../../form/Type";
import {SelectBox} from "../../../ui";
import {RadioChip} from "../../../ui";
import {RadioInput} from "../../../ui";
import {EntityForm} from "../../../config/EntityForm";
import {InputRendererProps} from "../../../config/Config";
import {OptionsLoader} from "../SelectField";

// ============================================================================
// 모듈 레벨 캐시 - 옵션 로더별로 데이터 캐싱
// ============================================================================
interface CacheEntry {
  data: SelectOption[];
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5분
const optionsCache = new Map<string, CacheEntry>();

export function getCachedOptions(cacheKey: string): SelectOption[] | null {
  const entry = optionsCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    optionsCache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

export function setCachedOptions(cacheKey: string, data: SelectOption[]): void {
  optionsCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateDynamicSelectCache(keyPattern?: string): void {
  if (keyPattern) {
    for (const key of optionsCache.keys()) {
      if (key.includes(keyPattern)) {
        optionsCache.delete(key);
      }
    }
  } else {
    optionsCache.clear();
  }
}

// ============================================================================
// DynamicSelectFieldView 컴포넌트
// ============================================================================
export interface DynamicSelectFieldViewProps extends InputRendererProps {
  /** 필드명 (캐시 키로 사용) */
  fieldName: string;
  /** EntityForm 인스턴스 */
  entityForm: EntityForm;
  /** 옵션 로드 함수 */
  loadOptions: OptionsLoader;
  /** 정적 옵션 (loadOptions가 없을 때 사용) */
  staticOptions?: SelectOption[];
  /** 렌더링 타입: 'select' | 'chip' | 'radio' */
  renderType?: 'select' | 'chip' | 'radio';
  /** RadioInput용 combo 설정 */
  combo?: { direction?: 'row' | 'column' };
  /** 캐시 키 (동일한 loadOptions를 여러 필드에서 공유할 때) */
  cacheKey?: string;
}

export const DynamicSelectFieldView: React.FC<DynamicSelectFieldViewProps> = ({
  fieldName,
  entityForm,
  loadOptions,
  staticOptions,
  renderType = 'select',
  combo,
  cacheKey,
  value,
  onChange,
  readonly,
  required,
  placeHolder,
}) => {
  const [options, setOptions] = useState<SelectOption[]>(staticOptions ?? []);
  const [loading, setLoading] = useState(!staticOptions);
  const [mounted, setMounted] = useState(false);

  const entityFormRef = useRef(entityForm);
  entityFormRef.current = entityForm;
  const loadedRef = useRef(false);

  // 캐시 키 생성
  const effectiveCacheKey = useMemo(() => {
    return cacheKey ?? `dynamic_select_${fieldName}`;
  }, [cacheKey, fieldName]);

  // 옵션 로드
  useEffect(() => {
    if (loadedRef.current && options.length > 0) {
      return;
    }

    if (staticOptions && staticOptions.length > 0) {
      setOptions(staticOptions);
      setLoading(false);
      setMounted(true);
      loadedRef.current = true;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // 캐시 확인
        const cached = getCachedOptions(effectiveCacheKey);
        if (cached) {
          setOptions(cached);
          setLoading(false);
          setMounted(true);
          loadedRef.current = true;
          return;
        }

        // 옵션 로드
        setLoading(true);
        const loadedOptions = await loadOptions(entityFormRef.current);

        if (!cancelled) {
          setOptions(loadedOptions);
          setCachedOptions(effectiveCacheKey, loadedOptions);
          loadedRef.current = true;
        }
      } catch (e) {
        console.error(`[DynamicSelectFieldView:${fieldName}] Failed to load options:`, e);
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMounted(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCacheKey, fieldName]);

  if (loading || !mounted) {
    return (
      <div className="rcm-select-loading">
        <svg className="rcm-select-loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="rcm-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="rcm-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="rcm-select-loading-text">불러오는 중...</span>
      </div>
    );
  }

  const commonProps = {
    name: fieldName,
    value,
    onChange,
    readonly,
    required,
    placeHolder,
  };

  switch (renderType) {
    case 'chip':
      return (
        <RadioChip
          options={options}
          combo={combo ?? { direction: 'row' }}
          {...commonProps}
        />
      );
    case 'radio':
      return (
        <RadioInput
          options={options}
          combo={combo}
          {...commonProps}
        />
      );
    case 'select':
    default:
      return (
        <SelectBox
          options={options}
          {...commonProps}
        />
      );
  }
};

export default DynamicSelectFieldView;
