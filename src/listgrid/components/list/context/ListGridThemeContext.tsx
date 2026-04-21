'use client';

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import {
  ViewListGridClassNames,
  ListGridThemeVariant,
  ListGridThemeContextValue,
} from '../types/ViewListGridTheme.types';
import { cn as cnUtil } from '../../../utils/cn';
import { defaultListGridTheme } from '../themes/defaultListGridTheme';
import { mainListGridTheme } from '../themes/variants/mainTheme';
import { subCollectionListGridTheme } from '../themes/variants/subCollectionTheme';
import { modalListGridTheme } from '../themes/variants/modalTheme';

/**
 * 두 객체를 깊게 병합하는 유틸리티
 * 커스텀 테마가 기본 테마를 오버라이드
 */
const deepMerge = <T extends object>(base: T, override: Partial<T> | undefined): T => {
  if (!override) return base;

  const result = { ...base };

  for (const key in override) {
    if (Object.prototype.hasOwnProperty.call(override, key)) {
      const baseValue = base[key];
      const overrideValue = override[key];

      if (
        baseValue &&
        overrideValue &&
        typeof baseValue === 'object' &&
        typeof overrideValue === 'object' &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
      ) {
        // 중첩 객체 병합
        (result as Record<string, unknown>)[key] = deepMerge(
          baseValue as object,
          overrideValue as Partial<object>,
        );
      } else if (overrideValue !== undefined) {
        // 값 오버라이드
        result[key] = overrideValue as T[typeof key];
      }
    }
  }

  return result;
};

/**
 * Variant에 따른 프리셋 테마 가져오기
 */
const getVariantTheme = (
  variant: ListGridThemeVariant,
): Partial<ViewListGridClassNames> | undefined => {
  switch (variant) {
    case 'main':
      return mainListGridTheme;
    case 'subCollection':
      return subCollectionListGridTheme;
    case 'modal':
    case 'popup':
      return modalListGridTheme;
    default:
      return undefined;
  }
};

/**
 * ListGrid 테마 컨텍스트
 * ViewListGrid과 하위 컴포넌트에서 스타일을 커스터마이징하는데 사용
 */
const ListGridThemeContext = createContext<ListGridThemeContextValue>({
  classNames: defaultListGridTheme,
  cn: (base, custom) => (custom ? cnUtil(base, custom) : base),
  variant: 'default',
});

/**
 * ListGrid 테마 Provider Props
 */
export interface ListGridThemeProviderProps {
  /** 커스텀 테마 (기본 테마에 병합됨) */
  theme?: Partial<ViewListGridClassNames>;
  /** 테마 변형 (default, main, subCollection, modal) */
  variant?: ListGridThemeVariant;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * ListGrid 테마 Provider
 *
 * ListGrid에 테마를 적용할 때 사용합니다.
 * variant를 지정하면 해당 프리셋 테마가 자동으로 적용됩니다.
 *
 * @example
 * ```tsx
 * // 서브콜렉션에서 사용
 * <ListGridThemeProvider variant="subCollection">
 *   <ViewListGrid {...props} />
 * </ListGridThemeProvider>
 *
 * // 커스텀 테마 적용
 * const customTheme = {
 *   panel: { container: 'mt-8 border-2 rounded-2xl' },
 * };
 * <ListGridThemeProvider theme={customTheme}>
 *   <ViewListGrid {...props} />
 * </ListGridThemeProvider>
 * ```
 */
export const ListGridThemeProvider: React.FC<ListGridThemeProviderProps> = ({
  theme,
  variant = 'default',
  children,
}) => {
  const value = useMemo<ListGridThemeContextValue>(() => {
    // 1. 기본 테마
    let mergedClassNames = { ...defaultListGridTheme };

    // 2. Variant 프리셋 적용
    const variantTheme = getVariantTheme(variant);
    if (variantTheme) {
      mergedClassNames = deepMerge(mergedClassNames, variantTheme);
    }

    // 3. 커스텀 테마 적용 (최우선)
    if (theme) {
      mergedClassNames = deepMerge(mergedClassNames, theme) as ViewListGridClassNames;
    }

    return {
      classNames: mergedClassNames,
      cn: (base: string, custom?: string) => {
        if (!custom) return base;
        return cnUtil(base, custom);
      },
      variant,
    };
  }, [theme, variant]);

  return <ListGridThemeContext.Provider value={value}>{children}</ListGridThemeContext.Provider>;
};

/**
 * ListGrid 테마 훅
 *
 * ViewListGrid의 하위 컴포넌트에서 테마 클래스를 가져올 때 사용합니다.
 *
 * @example
 * ```tsx
 * const { classNames, cn, variant } = useListGridTheme();
 *
 * return (
 *   <div className={cn('flex items-center', classNames.header?.container)}>
 *     ...
 *   </div>
 * );
 * ```
 */
export const useListGridTheme = (): ListGridThemeContextValue => {
  const context = useContext(ListGridThemeContext);

  if (!context) {
    // Context가 없으면 기본값 반환 (Provider 없이도 동작)
    return {
      classNames: defaultListGridTheme,
      cn: (base, custom) => (custom ? cnUtil(base, custom) : base),
      variant: 'default',
    };
  }

  return context;
};

/**
 * 특정 variant의 테마 클래스를 직접 가져오는 유틸리티
 *
 * Provider 없이 특정 variant의 테마를 사용하고 싶을 때 활용합니다.
 *
 * @example
 * ```tsx
 * const subCollectionTheme = getListGridThemeByVariant('subCollection');
 * ```
 */
export const getListGridThemeByVariant = (
  variant: ListGridThemeVariant,
): ViewListGridClassNames => {
  let mergedClassNames = { ...defaultListGridTheme };
  const variantTheme = getVariantTheme(variant);
  if (variantTheme) {
    mergedClassNames = deepMerge(mergedClassNames, variantTheme);
  }
  return mergedClassNames;
};

export { ListGridThemeContext };
