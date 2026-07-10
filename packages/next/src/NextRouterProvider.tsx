'use client';

// NextRouterProvider — thin adapter wiring @listgrid/react's RouterProvider
// (the C7 navigation seam) to next/navigation's App Router useRouter(). Hosts
// on Next.js wrap their tree in this instead of hand-rolling the {push,replace}
// value themselves.

import type { ReactNode } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import { RouterProvider } from '@listgrid/react';

export interface NextRouterProviderProps {
  children?: ReactNode;
}

export function NextRouterProvider({ children }: NextRouterProviderProps) {
  const router = useNextRouter();
  return (
    <RouterProvider
      value={{
        push: (url: string) => router.push(url),
        replace: (url: string) => router.replace(url),
      }}
    >
      {children}
    </RouterProvider>
  );
}
