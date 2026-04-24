'use client';

import React, { useEffect, useState } from 'react';
import { FormField, FormFieldProps } from '../fields/abstract';
import { FieldRenderParameters, FilterRenderParameters } from '../../config/EntityField';
import { SearchForm } from '../../form/SearchForm';
import { PageResult } from '../../form/Type';
import { useModalManagerStore } from '../../store';
import { useSession } from '../../auth';
import { ViewEntityForm } from '../form/ViewEntityForm';
import { IconHistory } from '@tabler/icons-react';
import { fDateTime } from '../../misc';
import { EntityForm } from '../../config/EntityForm';
import { Pagination } from '../../ui';
import { getTranslation } from '../../utils/i18n';
import { getEndpoint } from '../../config/RuntimeConfig';

// Audit/timestamp fields excluded from diff (always change on every update)
const AUDIT_FIELD_NAMES = new Set([
  'updatedAt',
  'dateUpdated',
  'modifiedAt',
  'dateModified',
  'lastModified',
  'lastModifiedDate',
  'auditable',
]);

/**
 * Compare two revision data objects and return the set of field names that differ.
 */
function getChangedFields(
  currentData: Record<string, any>,
  previousData: Record<string, any>,
): Set<string> {
  const changed = new Set<string>();
  const allKeys = new Set([...Object.keys(currentData), ...Object.keys(previousData)]);
  for (const key of allKeys) {
    if (JSON.stringify(currentData[key]) !== JSON.stringify(previousData[key])) {
      changed.add(key);
    }
  }
  return changed;
}

/**
 * Wrapper component that injects CSS-based highlighting for changed fields.
 * Uses data-field-name attribute selectors so highlighting applies automatically as fields render.
 */
const RevisionDiffWrapper: React.FC<{
  changedFields: Set<string>;
  fieldLabelMap: Map<string, string>;
  hasPreviousRevision: boolean;
  children: React.ReactNode;
}> = ({ changedFields, fieldLabelMap, hasPreviousRevision, children }) => {
  const containerId = 'revision-diff-container';

  const selectors =
    changedFields.size > 0
      ? Array.from(changedFields)
          .map((name) => `#${containerId} [data-field-name="${name}"]`)
          .join(',\n')
      : '';

  // Resolve display labels for changed fields (use label if available, skip otherwise)
  const changedFieldLabels = Array.from(changedFields)
    .map((name) => fieldLabelMap.get(name))
    .filter((label): label is string => !!label);

  return (
    <div id={containerId} className="rcm-revision-diff-container">
      {changedFields.size > 0 && (
        <>
          <style>{`
            ${selectors} {
              background-color: rgba(251, 191, 36, 0.12);
              border-left: 3px solid rgb(245, 158, 11);
              padding-left: 8px;
              border-radius: 4px;
            }
          `}</style>
          <div className="rcm-revision-diff-banner rcm-revision-diff-banner-changed">
            <div className="rcm-revision-diff-banner-row">
              <span
                className="rcm-icon-frame"
                data-shape="circle"
                data-size="xs"
                data-color="warning"
              ></span>
              <span>
                이전 버전 대비 <strong>{changedFields.size}개</strong> 필드가 변경되었습니다
              </span>
            </div>
            {changedFieldLabels.length > 0 && (
              <div className="rcm-revision-diff-labels">
                {changedFieldLabels.map((label, i) => (
                  <span key={i} className="rcm-tag" data-color="warning">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {hasPreviousRevision && changedFields.size === 0 && (
        <div className="rcm-revision-diff-banner rcm-revision-diff-banner-same">
          이전 버전과 동일합니다
        </div>
      )}
      {children}
    </div>
  );
};

interface Revision {
  id: string; // 해당 Revision 의 고유 ID. 어플리케이션 관점에서는 아무 의미 없는 데이터이며, loop 할 때 key 로 사용해도 된다.
  createdAt: Date; // 해당 Revision 의 생성 일시
  createdBy: string; // 해당 Revision 의 생성자 세션 ID
  json: string; // 해당 Revision 의 JSON 데이터. 값을 parsing 해서 EntityForm.setFetchValues 를 이용해 값을 해당 버전의 데이터로 만들 수 있다.
  name: string; // 해당 Revision 을 만든 사용자 이름
  type?: string; // RevisionType: CREATE, UPDATE, DELETE
}

interface RevisionFieldProps extends FormFieldProps {}

export class RevisionField extends FormField<RevisionField> {
  private apiUrlOverride?: string;

  constructor(name: string, order: number) {
    super(name, order, 'revision');
  }

  protected createInstance(name: string, order: number): RevisionField {
    return new RevisionField(name, order);
  }

  /** Override the revision API URL for this field instance. */
  withApiUrl(url: string): this {
    this.apiUrlOverride = url;
    return this;
  }

  getApiUrl(): string {
    return this.apiUrlOverride ?? getEndpoint('revisionApi');
  }

  protected async renderInstance(params: FieldRenderParameters): Promise<React.ReactNode | null> {
    const { entityForm, subCollectionEntity } = params;

    // subCollectionEntity인 경우 렌더링하지 않음
    if (subCollectionEntity) {
      return null;
    }

    // CREATE 모드에서는 렌더링하지 않음 (MODIFY_ONLY)
    if (entityForm.getRenderType() === 'create') {
      return null;
    }

    return <RevisionFieldRenderer entityForm={entityForm} apiUrl={this.getApiUrl()} />;
  }

  protected renderListFilterInstance(
    params: FilterRenderParameters,
  ): Promise<React.ReactNode | null> {
    // 리스트 필터에서는 지원하지 않음
    return Promise.resolve(null);
  }

  static create(props: RevisionFieldProps): RevisionField {
    return new RevisionField(props.name, props.order).copyFields(props, true);
  }
}

interface RevisionFieldRendererProps {
  entityForm: EntityForm;
  apiUrl: string;
}

const RevisionFieldRenderer: React.FC<RevisionFieldRendererProps> = ({ entityForm, apiUrl }) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const { openModal } = useModalManagerStore();
  const session = useSession();

  useEffect(() => {
    loadRevisions(0);
  }, [entityForm.id]);

  const loadRevisions = async (page: number = 0) => {
    if (!entityForm.id) return;

    setLoading(true);
    try {
      const entityId = entityForm.id!;

      // revisionEntityName 필터 제거 - entityId만으로 조회 (revisionEntityName 불일치 문제 해결)
      const searchForm = new SearchForm()
        .handleAndFilter('revisionEntityId', entityId)
        .withSort('createdAt', 'DESC')
        .withPage(page)
        .withPageSize(10);

      const searchResult = await PageResult.fetchListData(apiUrl, searchForm);

      if (searchResult && searchResult.list) {
        setRevisions(searchResult.list as Revision[]);
        setTotalPage(searchResult.totalPage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('[RevisionField] Failed to load revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadRevisions(page - 1); // Pagination 컴포넌트는 1부터 시작, SearchForm은 0부터 시작
  };

  const handleRevisionClick = async (revision: Revision, index: number) => {
    const modalId = `revision-modal-${entityForm.id}`;

    // 리비전 데이터 파싱
    const revisionData = JSON.parse(revision.json);

    // 이전 리비전과 비교하여 변경된 필드 찾기
    // DELETE 리비전은 json이 없으므로 건너뛰고 다음 유효한 리비전을 찾는다
    let previousRevision: Revision | undefined;
    for (let i = index + 1; i < revisions.length; i++) {
      if (revisions[i]!.type !== 'DELETE' && revisions[i]!.json) {
        previousRevision = revisions[i];
        break;
      }
    }
    let changedFields = new Set<string>();
    if (previousRevision) {
      const previousData = JSON.parse(previousRevision.json);
      changedFields = getChangedFields(revisionData, previousData);
      // 수정일 등 항상 변경되는 감사(audit) 필드 제외
      changedFields = new Set([...changedFields].filter((name) => !AUDIT_FIELD_NAMES.has(name)));
    }

    // EntityForm 복제 및 초기화
    let revisionEntityForm = entityForm.clone(false);
    // 서버 fetch 대신 설정한 데이터로 고정하기 위해 url 을 비워둔다.
    revisionEntityForm.url = '';
    revisionEntityForm.fields.delete('entityForm-revision'); // 리비전 필드는 보여주지 않는다.
    revisionEntityForm.collections.clear(); // 컬렉션은 Revision 의 관리 대상이 아니다.
    revisionEntityForm.buttons = []; // 기존 엔티티폼의 사용자정의 버튼도 모두 제거한다.

    // 리비전 데이터로 값 설정
    revisionEntityForm = await revisionEntityForm.setFetchedValues(revisionData);

    // 변경 필드의 사용자 표시용 라벨 맵 구성
    const { t } = getTranslation();
    const fieldLabelMap = new Map<string, string>();
    for (const [key, field] of revisionEntityForm.fields) {
      if (field instanceof FormField) {
        const label = field.getLabel();
        if (typeof label === 'string') {
          fieldLabelMap.set(key, t(label));
        }
      }
    }

    openModal({
      modalId,
      title: `변경 이력 (${revision.name} / ${fDateTime(revision.createdAt, 'yyyy-MM-dd HH:mm:ss')})`,
      size: 'full',
      fullHeight: true,
      content: (
        <RevisionDiffWrapper
          changedFields={changedFields}
          fieldLabelMap={fieldLabelMap}
          hasPreviousRevision={!!previousRevision}
        >
          <ViewEntityForm
            readonly={true}
            entityForm={revisionEntityForm}
            {...(session !== undefined ? { session } : {})}
            hideTitle={true}
            hideAllButtons={true}
          />
        </RevisionDiffWrapper>
      ),
    });
  };

  if (loading) {
    return (
      <div className="rcm-revision-state">
        <IconHistory
          className="rcm-icon rcm-revision-state-icon-spin"
          data-size="lg"
          data-tone="disabled"
        />
        <span className="rcm-text" data-size="sm" data-tone="muted">
          변경 내역을 불러오는 중...
        </span>
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="rcm-revision-state rcm-revision-state-empty">
        <IconHistory className="rcm-icon" data-size="lg" data-tone="disabled" />
        <span className="rcm-text" data-size="sm" data-tone="muted">
          변경 내역이 없습니다.
        </span>
      </div>
    );
  }

  return (
    <div className="rcm-revision-wrap">
      <div className="rcm-revision-panel">
        <div className="rcm-revision-list">
          {revisions.map((revision, index) => {
            const isLatest = currentPage === 0 && index === 0;
            const isDelete = revision.type === 'DELETE';
            const isCreate = revision.type === 'CREATE';
            const isClickable = !isDelete && !isCreate;
            const itemClass = isLatest
              ? 'rcm-revision-item rcm-revision-item-latest'
              : isDelete || isCreate
                ? 'rcm-revision-item rcm-revision-item-muted'
                : 'rcm-revision-item rcm-revision-item-default';
            return (
              <div
                key={revision.id}
                className={itemClass}
                onClick={isClickable ? () => handleRevisionClick(revision, index) : undefined}
              >
                <div className="rcm-revision-item-row">
                  <span className="rcm-text" data-weight="medium">
                    {revision.name}
                  </span>
                  <span className="rcm-text" data-size="xs" data-tone="muted">
                    {fDateTime(revision.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                  {isLatest && (
                    <span className="rcm-badge" data-color="info">
                      현재 버전
                    </span>
                  )}
                  {isCreate && (
                    <span className="rcm-badge" data-color="success">
                      신규
                    </span>
                  )}
                  {isDelete && (
                    <span className="rcm-badge" data-color="error">
                      {entityForm.neverDelete ? '사용안함' : '삭제'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {totalPage > 1 && (
          <div className="rcm-revision-pagination">
            <Pagination total={totalPage} value={currentPage + 1} onChange={handlePageChange} />
          </div>
        )}
      </div>
    </div>
  );
};
