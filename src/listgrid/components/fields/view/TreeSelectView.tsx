'use client';

import { EntityForm } from '../../../config/EntityForm';
import React, { useEffect, useState } from 'react';
import { Tree, TreeNodeData } from '../../../ui';
import { LoadingOverlay } from '../../../ui';
import { ManyToOneTreeView } from '../../../config/Config';
import { getExternalApiDataWithError } from '../../../misc';
import { isTrue } from '../../../utils/BooleanUtil';
import { Tooltip } from '../../../ui';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface TreeSelectViewProps {
  entityForm: EntityForm;
  tree: ManyToOneTreeView;
  onSelect: (item: any) => void;
  selectable?: boolean;
  readonly?: boolean;
}

export const TreeSelectView = ({ readonly = false, ...props }: TreeSelectViewProps) => {
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const selectable = isTrue(props.selectable, true);
  const config = props.tree;

  useEffect(() => {
    if (props.tree.treeData !== undefined) {
      setTreeData(props.tree.treeData);
      setLoading(false);
    } else {
      fetchTreeData();
    }
  }, []);

  if (loading)
    return (
      <div className={'relative'}>
        <LoadingOverlay visible={true} />
        <div className={'w-full h-[200px]'}></div>
      </div>
    );

  if (isEmpty(treeData)) {
    return <div>등록된 데이터가 존재하지 않습니다.</div>;
  }

  return (
    <div>
      <div className={'text-danger text-sm pb-2'}>{error}</div>
      <div className={'flex items-start min-h-[200px] w-full'}>
        <Tree
          data={treeData}
          className={'w-full'}
          levelOffset={20}
          expandOnClick={false} // We only expand via icon clicks
          selectOnClick={selectable} // Enable built-in selection if selectable
          maxHeight="60vh" // Enable auto scroll for long trees
          enhancedRendering={true} // Use enhanced default rendering
          levelStyles={{
            fontWeight: true, // Apply font weight differentiation by level
          }}
          renderNode={
            selectable
              ? ({
                  level,
                  node,
                  tree,
                  expanded,
                  hasChildren,
                  elementProps,
                }: {
                  level: any;
                  node: any;
                  tree: any;
                  expanded: any;
                  hasChildren: any;
                  elementProps: any;
                }) => {
                  // Only customize rendering when selection is needed
                  // 선택이 필요한 경우에만 렌더링 커스터마이징
                  return (
                    <div
                      {...elementProps}
                      key={`${node.value}-${level}`}
                      className="rcm-tree-node"
                      style={{ paddingLeft: `${(level - 1) * 20}px` }}
                    >
                      <div className="rcm-tree-node-icon-wrap">
                        {hasChildren ? (
                          <button
                            className="rcm-tree-node-toggle"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              tree.toggleExpanded(node.value);
                            }}
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                          >
                            {expanded ? (
                              <IconChevronDown size={14} />
                            ) : (
                              <IconChevronRight size={14} />
                            )}
                          </button>
                        ) : (
                          <div className="rcm-tree-node-leaf">
                            <div className="rcm-tree-node-leaf-dot"></div>
                          </div>
                        )}
                      </div>

                      {(isTrue(config.rootSelectable, true) || level !== 1) &&
                      (isTrue(config.leafSelectable, true) || hasChildren) ? (
                        <Tooltip label={`${node.label} 선택`} zIndex={10000}>
                          <button
                            className="rcm-tree-node-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (readonly) return;

                              let disabled =
                                config.exceptId !== undefined && config.exceptId === node.value;

                              if (!disabled) {
                                if (isNodeInExceptTree(node, config.exceptId)) {
                                  disabled = true;
                                }
                              }

                              if (disabled) {
                                setError(
                                  '자기 자신 또는 자기 자신의 하위 데이터는 선택할 수 없습니다.',
                                );
                                return;
                              }

                              setError('');
                              props.onSelect({ id: node.value, name: node.label });
                            }}
                          >
                            {node.label}
                          </button>
                        </Tooltip>
                      ) : (
                        <span className="rcm-tree-node-span">{node.label}</span>
                      )}
                    </div>
                  );
                }
              : undefined
          }
        />
      </div>
    </div>
  );

  function fetchTreeData() {
    if (config.treeData !== undefined) {
      setTreeData(config.treeData);
    } else {
      const fetchConfig = config.fetch!;

      const url = fetchConfig.url;
      const method = fetchConfig.method ?? 'GET';
      const requestBody = fetchConfig.requestBody;
      const convert = fetchConfig.convert;

      (async () => {
        const response = await getExternalApiDataWithError({
          url: url,
          method: method,
          formData: method === 'GET' ? undefined : requestBody,
        });

        if (response.data) {
          if (convert !== undefined) {
            response.data = convert(response.data);
          }
          setTreeData(response.data);
          setLoading(false);
        } else {
          setError(response.error ?? '데이터를 조회할 수 없습니다.');
          setLoading(false);
        }
      })();
    }
  }

  function isNodeInExceptTree(node: TreeNodeData, exceptId?: string): boolean {
    if (!exceptId) return false;

    // Define a recursive function to search for exceptId in the tree
    const searchTree = (currentNode: TreeNodeData | undefined): boolean => {
      if (!currentNode) return false;

      if (currentNode.value === exceptId) return true;

      if (currentNode.children) {
        for (const child of currentNode.children) {
          if (searchTree(child)) {
            return true;
          }
        }
      }

      return false;
    };

    return searchTree(node);
  }

  function isEmpty(data: TreeNodeData[]): boolean {
    return data.length === 0;
  }
};
