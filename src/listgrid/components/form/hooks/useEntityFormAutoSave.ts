'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EntityForm } from '../../../config/EntityForm';

const AUTO_SAVE_PREFIX = 'entityform_autosave_';
const AUTO_SAVE_DEBOUNCE_MS = 1000; // 1초 디바운스

interface AutoSaveData {
  values: Record<string, any>;
  savedAt: number;
  entityName: string;
  entityId?: string;
}

interface UseEntityFormAutoSaveOptions {
  entityForm?: EntityForm;
  enabled: boolean;
  autoSaveKey?: string;
}

/**
 * EntityForm 자동 저장 훅
 * - sessionStorage에 필드 값을 자동 저장
 * - 새로고침 시 저장된 값 복원
 * - 탭/브라우저 닫으면 자동 삭제 (sessionStorage 특성)
 */
export function useEntityFormAutoSave({
  entityForm,
  enabled,
  autoSaveKey,
}: UseEntityFormAutoSaveOptions) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoredRef = useRef(false);

  // 스토리지 키 생성
  const getStorageKey = useCallback(() => {
    if (!entityForm) return null;
    const entityName = entityForm.name;
    const entityId = entityForm.id ?? 'create';
    const suffix = autoSaveKey ? `_${autoSaveKey}` : '';
    return `${AUTO_SAVE_PREFIX}${entityName}_${entityId}${suffix}`;
  }, [entityForm, autoSaveKey]);

  // 현재 필드 값들을 가져오기
  const getFieldValues = useCallback(async (): Promise<Record<string, any>> => {
    if (!entityForm) return {};

    const values: Record<string, any> = {};
    const fields = entityForm.getFields();

    for (const field of fields) {
      try {
        const fieldName = field.name;
        const value = await field.getCurrentValue('update');
        // undefined나 null이 아닌 값만 저장
        if (value !== undefined && value !== null) {
          values[fieldName] = value;
        }
      } catch (e) {
        // 값을 가져올 수 없는 필드는 건너뜀
      }
    }

    return values;
  }, [entityForm]);

  // sessionStorage에 저장
  const saveToStorage = useCallback(async () => {
    if (!enabled || !entityForm || typeof window === 'undefined') return;

    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const values = await getFieldValues();

      // 저장할 값이 없으면 스킵
      if (Object.keys(values).length === 0) return;

      const data: AutoSaveData = {
        values,
        savedAt: Date.now(),
        entityName: entityForm.name,
        ...(entityForm.id !== undefined ? { entityId: entityForm.id } : {}),
      };

      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to auto-save EntityForm:', e);
    }
  }, [enabled, entityForm, getStorageKey, getFieldValues]);

  // sessionStorage에서 복원
  const restoreFromStorage = useCallback(async (): Promise<boolean> => {
    if (!enabled || !entityForm || typeof window === 'undefined') return false;

    const storageKey = getStorageKey();
    if (!storageKey) return false;

    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return false;

      const data: AutoSaveData = JSON.parse(saved);

      // 엔티티 이름이 일치하는지 확인
      if (data.entityName !== entityForm.name) {
        sessionStorage.removeItem(storageKey);
        return false;
      }

      // 저장된 값을 필드에 적용
      for (const [fieldName, value] of Object.entries(data.values)) {
        const field = entityForm.getField(fieldName);
        if (field && value !== undefined) {
          // withDefaultValue를 사용하여 초기값으로 설정
          field.withDefaultValue(value);
        }
      }

      return true;
    } catch (e) {
      console.error('Failed to restore EntityForm from auto-save:', e);
      return false;
    }
  }, [enabled, entityForm, getStorageKey]);

  // sessionStorage에서 삭제
  const clearStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storageKey = getStorageKey();
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  }, [getStorageKey]);

  // 디바운스된 저장 함수
  const debouncedSave = useCallback(() => {
    if (!enabled) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveToStorage();
    }, AUTO_SAVE_DEBOUNCE_MS);
  }, [enabled, saveToStorage]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 초기 복원 (한 번만 실행)
  useEffect(() => {
    if (enabled && entityForm && !isRestoredRef.current) {
      isRestoredRef.current = true;
      restoreFromStorage();
    }
  }, [enabled, entityForm, restoreFromStorage]);

  return {
    /** 현재 상태를 즉시 저장 */
    saveNow: saveToStorage,
    /** 디바운스된 저장 (필드 변경 시 호출) */
    triggerSave: debouncedSave,
    /** 저장된 데이터 삭제 */
    clearAutoSave: clearStorage,
    /** 저장된 데이터 복원 */
    restore: restoreFromStorage,
  };
}
