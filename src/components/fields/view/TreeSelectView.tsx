/*
 * Copyright (c) "2024". rchemist.io by Rchemist
 * Licensed under the Rchemist Common License, Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License under controlled by Rchemist
 */

'use client'

import {EntityForm} from '../../../config/EntityForm';
import React, {useEffect, useState} from "react";
import {Tree, TreeNodeData} from "@gjcu/ui/elements/tree";
import {LoadingOverlay} from "@gjcu/ui/elements/indicator/LoadingOverlay";
import {ManyToOneTreeView} from '../../../config/Config';
import {getExternalApiDataWithError} from "@gjcu/ui";
import {isTrue} from '../../../../utils/BooleanUtil';
import {Tooltip} from "@gjcu/ui/elements/tooltip/Tooltip";
import {IconChevronDown, IconChevronRight} from "@tabler/icons-react";

interface TreeSelectViewProps {
  entityForm: EntityForm;
  tree: ManyToOneTreeView;
  onSelect: (item: any) => void;
  selectable?: boolean;
  readonly?: boolean;
}

export const TreeSelectView = ({readonly = false, ...props}: TreeSelectViewProps) => {

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
    return <div className={'relative'}>
      <LoadingOverlay visible={true}/>
      <div className={'w-full h-[200px]'}></div>
    </div>;

  if (isEmpty(treeData)) {
    return <div>등록된 데이터가 존재하지 않습니다.</div>;
  }

  return <div>
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
          fontWeight: true // Apply font weight differentiation by level
        }}
        renderNode={selectable ? ({level, node, tree, expanded, hasChildren, elementProps}) => {
          // Only customize rendering when selection is needed
          // 선택이 필요한 경우에만 렌더링 커스터마이징
          return (
            <div 
              {...elementProps} 
              key={`${node.value}-${level}`} 
              className="w-full flex items-center py-1"
              style={{ paddingLeft: `${(level - 1) * 20}px` }}
            >
              {/* Icon area - consistent width for all nodes */}
              {/* 아이콘 영역 - 모든 노드에 일관된 너비 */}
              <div className="flex items-center justify-center w-6 h-6 mr-2 flex-shrink-0">
                {hasChildren ? (
                  <button
                    className="flex items-center justify-center w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      tree.toggleExpanded(node.value);
                    }}
                    aria-label={expanded ? "Collapse" : "Expand"}
                  >
                    {expanded ? (
                      <IconChevronDown size={14} />
                    ) : (
                      <IconChevronRight size={14} />
                    )}
                  </button>
                ) : (
                  /* Empty space for leaf nodes to maintain alignment */
                  /* 리프 노드를 위한 빈 공간으로 정렬 유지 */
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                )}
              </div>
              
              {/* Node content */}
              {(
                (isTrue(config.rootSelectable, true) || level !== 1) && 
                (isTrue(config.leafSelectable, true) || hasChildren)
              ) ? (
                <Tooltip label={`${node.label} 선택`} zIndex={10000}>
                  <button
                    className={`flex-1 text-left py-2 px-3 rounded-md transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 font-medium text-gray-900 dark:text-gray-100`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (readonly) return;

                      let disabled = config.exceptId !== undefined && config.exceptId === node.value;

                      if (!disabled) {
                        if (isNodeInExceptTree(node, config.exceptId)) {
                          disabled = true;
                        }
                      }

                      if (disabled) {
                        setError('자기 자신 또는 자기 자신의 하위 데이터는 선택할 수 없습니다.');
                        return;
                      }

                      setError('');
                      props.onSelect({id: node.value, name: node.label});
                    }}
                  >
                    {node.label}
                  </button>
                </Tooltip>
              ) : (
                <span className="flex-1 py-2 px-3 text-gray-400 dark:text-gray-500 text-sm">
                  {node.label}
                </span>
              )}
            </div>
          );
        } : undefined}
      />
    </div>
  </div>;



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
          formData: method === 'GET' ? undefined : requestBody
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

}
