'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from '../auth';
import { usePathname } from '../router';
import { Breadcrumb, BreadcrumbItem } from '../ui';
import { PermissionType } from '../config/Config';

import { LoadingOverlay } from '../ui';
import { Skeleton } from '../ui';
import { ViewListGridProps } from '../components/list/types/ViewListGrid.types';
import { dynamic } from '../utils/lazy';
import { checkAdminMenuPermission, DEFAULT_MENU_ALIAS } from '../menu/MenuPermissionChecker';

// Dynamic import with better optimization
const ViewListGrid = dynamic(
  () =>
    import('../components/list/ViewListGrid').then((mod) => ({
      default: mod.ViewListGrid,
    })),
  {
    ssr: false,
    loading: () => (
      <div className={'relative'}>
        <LoadingOverlay visible={true} />
        <div className={'w-full h-[400px]'}></div>
      </div>
    ),
  },
);

interface OptimizedViewListGridWrapperProps {
  props: ViewListGridProps;
  breadcrumbs?: BreadcrumbItem[];
  anonymous?: boolean;
}

export const ViewListGridWrapper: React.FC<OptimizedViewListGridWrapperProps> = React.memo(
  ({ props, breadcrumbs, anonymous }) => {
    const [mounted, setMounted] = useState(false);
    const [permissionType, setPermissionType] = useState<PermissionType>();

    const session = useSession();
    const pathname = usePathname()!;

    // Memoize listGrid options to prevent unnecessary re-renders
    const listGridOptions = useMemo(() => {
      const options = { ...props.options };
      if (permissionType === 'READ') {
        options.readonly = true;
      }
      return options;
    }, [props.options, permissionType]);

    useEffect(() => {
      let isMounted = true;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      (async () => {
        if (anonymous) {
          if (isMounted) {
            setPermissionType('ALL');
            setMounted(true);
          }
          return;
        }

        if (pathname === undefined) {
          return;
        }

        // 세션이 undefined인 경우 5초 후 타임아웃 처리
        if (session === undefined) {
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.warn('Session timeout - 5초 후에도 세션을 가져올 수 없습니다.');
              setPermissionType('NONE');
              setMounted(true);
            }
          }, 5000);
          return;
        }

        // 세션이 있으면 타임아웃 클리어
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = undefined;
        }

        try {
          const permissionType = await checkAdminMenuPermission({
            url: pathname,
            alias: DEFAULT_MENU_ALIAS,
          });

          if (isMounted) {
            setPermissionType(permissionType);
            setMounted(true);
          }
        } catch (error) {
          console.error('Permission check failed:', error);
          if (isMounted) {
            setPermissionType('NONE');
            setMounted(true);
          }
        }
      })();

      return () => {
        isMounted = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [session, pathname, anonymous]);

    // Memoize breadcrumb component
    const breadcrumbComponent = useMemo(
      () => <Breadcrumb type={'basic'} items={breadcrumbs} />,
      [breadcrumbs],
    );

    if (!mounted) {
      return (
        <div>
          {breadcrumbComponent}
          <div>
            <Skeleton visible={true}>
              <div className={'h-100 w-full'}></div>
            </Skeleton>
          </div>
        </div>
      );
    }

    if (permissionType === 'NONE') {
      return (
        <div>
          {breadcrumbComponent}
          <div className="rcm-permission-denied">
            <div className="rcm-permission-denied-inner">
              <div className="rcm-permission-denied-icon-wrap">
                <svg
                  className="rcm-permission-denied-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="rcm-permission-denied-title">접근 권한이 없습니다</h3>
              <p className="rcm-permission-denied-desc">
                이 페이지에 접근할 수 있는 권한이 없습니다.
                <br />
                관리자에게 문의하시기 바랍니다.
              </p>
              <button
                onClick={() => window.history.back()}
                className="rcm-button"
                data-variant="outline"
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        {breadcrumbComponent}
        <div>
          <Suspense
            fallback={
              <div className={'relative'}>
                <LoadingOverlay visible={true} />
                <div className={'w-full h-[400px]'}></div>
              </div>
            }
          >
            <ViewListGrid {...props} options={listGridOptions} />
          </Suspense>
        </div>
      </div>
    );
  },
);

ViewListGridWrapper.displayName = 'ViewListGridWrapper';
