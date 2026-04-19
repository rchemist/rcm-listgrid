/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스 병합 유틸리티
 * - clsx로 조건부 클래스를 처리하고
 * - tailwind-merge로 충돌하는 클래스를 스마트하게 병합
 *
 * @example
 * cn("p-4", "p-2") // => "p-2" (마지막 값이 적용)
 * cn("text-red-500", condition && "text-blue-500") // => 조건부 클래스
 * cn(baseClass, customClass) // => 기본 클래스 + 커스텀 클래스 병합
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
