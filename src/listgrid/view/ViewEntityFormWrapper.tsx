'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from '../auth';
import { usePathname, useSearchParams } from '../router';
import { Breadcrumb, BreadcrumbItem } from '../ui';
import { PermissionType } from '../config/Config';
import { checkAdminMenuPermission, DEFAULT_MENU_ALIAS } from '../menu/MenuPermissionChecker';
import { LoadingOverlay } from '../ui';
import { Skeleton } from '../ui';
import { Alert } from '../ui';
import { ViewEntityFormProps } from '../components/form/types/ViewEntityForm.types';
import { dynamic } from '../utils/lazy';

// Dynamic import with better optimization
const ViewEntityForm = dynamic(
  () =>
    import('../components/form/ViewEntityForm').then((mod) => ({
      default: mod.ViewEntityForm,
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

interface ViewEntityFormWrapperProps {
  props: ViewEntityFormProps;
  breadcrumbs?: BreadcrumbItem[];
  anonymous?: boolean;
  /**
   * 새창(팝업) 모드 여부
   * - true일 때 Breadcrumb 숨김
   * - ViewEntityFormProps에 popupMode 전달
   */
  popupMode?: boolean;
}

export const ViewEntityFormWrapper: React.FC<ViewEntityFormWrapperProps> = React.memo(
  ({ props, breadcrumbs, anonymous, popupMode: popupModeProp = false }) => {
    const [mounted, setMounted] = useState(false);
    const [permissionType, setPermissionType] = useState<PermissionType>();

    const session = useSession();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL 쿼리 파라미터에서 popup=true 감지 또는 prop으로 전달된 값 사용
    const popupMode = popupModeProp || searchParams.get('popup') === 'true';

    // popupMode일 때 body에 클래스 추가하여 레이아웃 요소 숨김
    useEffect(() => {
      if (popupMode) {
        document.body.classList.add('popup-mode');
        return () => {
          document.body.classList.remove('popup-mode');
        };
      }
      return undefined;
    }, [popupMode]);

    // Memoize entity form props to prevent unnecessary re-renders
    const entityFormProps = useMemo(() => {
      const finalProps = { ...props };
      if (permissionType === 'READ') {
        finalProps.readonly = true;
      }
      // 새창(팝업) 모드 전달
      if (popupMode) {
        finalProps.popupMode = true;
      }
      return finalProps;
    }, [props, permissionType, popupMode]);

    useEffect(() => {
      let isMounted = true;

      (async () => {
        if (anonymous) {
          if (isMounted) {
            setPermissionType('ALL');
            setMounted(true);
          }
          return;
        }

        if (session === undefined || pathname === undefined) {
          return;
        }

        try {
          const permissionType = await checkAdminMenuPermission({
            url: pathname!,
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
      };
    }, [session, pathname, anonymous]);

    // Memoize breadcrumb component (새창 모드에서는 숨김)
    const breadcrumbComponent = useMemo(() => {
      if (popupMode) return null;
      return <Breadcrumb type={'basic'} items={breadcrumbs} />;
    }, [breadcrumbs, popupMode]);

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
          <div>
            <Alert
              color={'danger'}
              size={'md'}
              strong={true}
              message={`message.no_permission`}
              className={'p-10 mt-4'}
              showCloseButton={false}
            />
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
            <ViewEntityForm {...entityFormProps} />
          </Suspense>
        </div>
      </div>
    );
  },
);

ViewEntityFormWrapper.displayName = 'ViewEntityFormWrapper';
