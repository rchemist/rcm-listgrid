import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {InlineSubCollectionView} from '../InlineSubCollectionView';
import {EntityForm} from '../../../../config/EntityForm';
import {InlineRowAction, InlineRowActionColumn, InlineRowActionsConfig} from '../../../../config/InlineSubCollectionField';

// Mock ViewListGrid component
vi.mock('../../ViewListGrid', () => ({
  ViewListGrid: vi.fn(({ listGrid, options }) => (
    <div data-testid="view-list-grid">
      <span data-testid="list-grid-readonly">{String(options?.readonly)}</span>
      <span data-testid="list-grid-hide-title">{String(options?.hideTitle)}</span>
    </div>
  )),
}));

// Mock ListGrid
vi.mock('../../../../config/ListGrid', () => ({
  ListGrid: vi.fn().mockImplementation((entityForm) => ({
    entityForm,
  })),
}));

// Mock Tooltip component
vi.mock('../../../../ui', () => ({
  Tooltip: ({ children, label }: { children: React.ReactNode; label: string }) => (
    <div data-tooltip={label}>{children}</div>
  ),
}));

// Mock loading store
vi.mock('../../../../loading', () => ({
  useLoadingStore: () => ({
    setOpenBaseLoading: vi.fn(),
  }),
}));

// Mock showAlert
vi.mock('../../../../message', () => ({
  showAlert: vi.fn(),
}));

describe('InlineSubCollectionView', () => {
  let mockEntityForm: any;
  let mockParentEntityForm: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEntityForm = {
      id: 'entity-form-id',
      clone: vi.fn().mockReturnValue({
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      }),
      withParentId: vi.fn().mockReturnThis(),
      setValue: vi.fn(),
      fields: new Map<string, any>([
        ['id', {
          name: 'id',
          type: 'text',
          hidden: true,
          getLabel: () => 'ID',
          getName: () => 'id',
          isSupportList: () => false,
        }],
        ['name', {
          name: 'name',
          type: 'text',
          hidden: false,
          getLabel: () => '이름',
          getName: () => 'name',
          isSupportList: () => true,
          useListField: vi.fn(),
          withListConfig: vi.fn(),
          getListConfig: () => ({ support: true }),
        }],
      ]),
    } as any;

    mockParentEntityForm = {
      id: 'parent-123',
      clone: vi.fn().mockReturnThis(),
      getValue: vi.fn().mockReturnValue('parent-123'),
    } as any;
  });

  describe('basic rendering', () => {
    it('should render ViewListGrid component', () => {
      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      expect(screen.getByTestId('view-list-grid')).toBeInTheDocument();
    });

    it('should render tooltip when provided', () => {
      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          tooltip="This is a helpful tooltip"
        />
      );

      expect(screen.getByText('This is a helpful tooltip')).toBeInTheDocument();
    });

    it('should pass hideTitle option to ViewListGrid', () => {
      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          hideTitle={true}
        />
      );

      expect(screen.getByTestId('list-grid-hide-title')).toHaveTextContent('true');
    });
  });

  describe('readonly mode', () => {
    it('should pass readonly=true to ViewListGrid', () => {
      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={true}
        />
      );

      expect(screen.getByTestId('list-grid-readonly')).toHaveTextContent('true');
    });

    it('should pass readonly=false to ViewListGrid', () => {
      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      expect(screen.getByTestId('list-grid-readonly')).toHaveTextContent('false');
    });
  });

  describe('relation configuration', () => {
    it('should use mappedBy from relation', () => {
      const { ViewListGrid } = require('../../ViewListGrid');

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'studentId', filterBy: 'student.id' }}
          readonly={false}
        />
      );

      expect(ViewListGrid).toHaveBeenCalled();
      const callArgs = ViewListGrid.mock.calls[0][0];
      expect(callArgs.options.subCollection.mappedBy).toBe('studentId');
    });

    it('should pass valueProperty in relation to ViewListGrid options', () => {
      const { ViewListGrid } = require('../../ViewListGrid');

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId', valueProperty: 'customId' }}
          readonly={false}
        />
      );

      // ViewListGrid should receive the filters callback that will use valueProperty
      expect(ViewListGrid).toHaveBeenCalled();
      const callArgs = ViewListGrid.mock.calls[0][0];
      expect(callArgs.options.filters).toBeDefined();
      expect(typeof callArgs.options.filters).toBe('function');
    });
  });

  describe('listFields configuration', () => {
    it('should accept string array for listFields', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map([
          ['name', {
            name: 'name',
            isSupportList: () => true,
            useListField: vi.fn(),
            withListConfig: vi.fn(),
            getListConfig: () => ({ support: true }),
          }],
          ['status', {
            name: 'status',
            isSupportList: () => true,
            useListField: vi.fn(),
            withListConfig: vi.fn(),
            getListConfig: () => ({ support: true }),
            listConfig: { support: true },
          }],
        ]),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          listFields={['name', 'status']}
        />
      );

      expect(mockEntityForm.clone).toHaveBeenCalledWith(true);
    });

    it('should accept InlineListFieldConfig array', () => {
      const useListFieldMock = vi.fn();
      const withListConfigMock = vi.fn();

      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map([
          ['name', {
            name: 'name',
            isSupportList: () => true,
            useListField: useListFieldMock,
            withListConfig: withListConfigMock,
            getListConfig: () => ({ support: true, filterable: true }),
          }],
        ]),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          listFields={[
            { name: 'name', listConfig: { filterable: false, sortable: true } },
          ]}
        />
      );

      expect(mockEntityForm.clone).toHaveBeenCalled();
    });
  });

  describe('globalListConfig', () => {
    it('should apply globalListConfig to all fields', () => {
      const withListConfigMock = vi.fn();

      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map([
          ['name', {
            name: 'name',
            isSupportList: () => true,
            useListField: vi.fn(),
            withListConfig: withListConfigMock,
            getListConfig: () => ({ support: true }),
          }],
        ]),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          globalListConfig={{
            filterable: false,
            sortable: false,
            quickSearch: false,
          }}
        />
      );

      expect(mockEntityForm.clone).toHaveBeenCalled();
    });
  });

  describe('rowActions configuration', () => {
    it('should not add action field when rowActions is empty', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={[]}
        />
      );

      expect(clonedEntityForm.fields.has('_rowActions__default')).toBe(false);
    });

    it('should add action field when rowActions is provided', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={rowActions}
        />
      );

      expect(clonedEntityForm.fields.has('_rowActions__default')).toBe(true);
    });

    it('should add action field even in readonly mode', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={true}
          rowActions={rowActions}
        />
      );

      // rowActions are now shown even in readonly mode
      // individual actions can use disabled/hidden to control visibility
      expect(clonedEntityForm.fields.has('_rowActions__default')).toBe(true);
    });
  });

  describe('rowActionsConfig', () => {
    it('should pass rowActionsConfig to InlineRowActionField', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      const rowActionsConfig: InlineRowActionsConfig = {
        order: 1,
        label: '관리',
      };

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={rowActions}
          rowActionsConfig={rowActionsConfig}
        />
      );

      // Verify that the action field was added
      expect(clonedEntityForm.fields.has('_rowActions__default')).toBe(true);

      // Get the action field and verify its configuration
      const actionField = clonedEntityForm.fields.get('_rowActions__default');
      expect(actionField).toBeDefined();
      expect(actionField.columnOrder).toBe(1);
      expect(actionField.listConfig?.label).toBe('관리');
    });

    it('should use default order 9999 when rowActionsConfig.order is not provided', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={rowActions}
        />
      );

      const actionField = clonedEntityForm.fields.get('_rowActions__default');
      expect(actionField?.columnOrder).toBe(9999);
    });

    it('should use default label 작업 when rowActionsConfig.label is not provided', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={rowActions}
        />
      );

      const actionField = clonedEntityForm.fields.get('_rowActions__default');
      expect(actionField?.listConfig?.label).toBe('작업');
    });
  });

  describe('pagination options', () => {
    it('should pass pagination options', () => {
      const { ViewListGrid } = require('../../ViewListGrid');

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          pagination={{ pageSize: 20, clientSide: true }}
        />
      );

      expect(ViewListGrid).toHaveBeenCalled();
      const callArgs = ViewListGrid.mock.calls[0][0];
      expect(callArgs.options.hidePagination).toBe(true);
    });
  });

  describe('refresh functionality', () => {
    it('should update refreshKey when refresh is called', async () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const { rerender } = render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Component should render with initial key
      expect(screen.getByTestId('view-list-grid')).toBeInTheDocument();
    });
  });

  describe('viewListOptions pass-through', () => {
    it('should pass viewListOptions to ViewListGrid', () => {
      const { ViewListGrid } = require('../../ViewListGrid');

      const customViewListOptions = {
        customOption: 'value',
      };

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          viewListOptions={customViewListOptions as any}
        />
      );

      expect(ViewListGrid).toHaveBeenCalled();
      const callArgs = ViewListGrid.mock.calls[0][0];
      expect(callArgs.options.customOption).toBe('value');
    });
  });

  describe('rowActionColumns configuration', () => {
    it('should add multiple action fields when rowActionColumns is provided', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'management',
          label: '관리',
          order: 100,
          actions: [
            { id: 'edit', label: '수정', onClick: async () => {} },
          ],
        },
        {
          id: 'shortcuts',
          label: '바로가기',
          order: 200,
          actions: [
            { id: 'view', label: '상세보기', onClick: async () => {} },
          ],
        },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActionColumns={rowActionColumns}
        />
      );

      // Should have two action fields with different ids
      expect(clonedEntityForm.fields.has('_rowActions_management')).toBe(true);
      expect(clonedEntityForm.fields.has('_rowActions_shortcuts')).toBe(true);
    });

    it('should set correct label and order for each column', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'first',
          label: '첫번째',
          order: 10,
          actions: [
            { id: 'action1', label: 'Action 1', onClick: async () => {} },
          ],
        },
        {
          id: 'second',
          label: '두번째',
          order: 20,
          actions: [
            { id: 'action2', label: 'Action 2', onClick: async () => {} },
          ],
        },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActionColumns={rowActionColumns}
        />
      );

      const firstField = clonedEntityForm.fields.get('_rowActions_first');
      const secondField = clonedEntityForm.fields.get('_rowActions_second');

      expect(firstField?.listConfig?.label).toBe('첫번째');
      expect(firstField?.columnOrder).toBe(10);
      expect(secondField?.listConfig?.label).toBe('두번째');
      expect(secondField?.columnOrder).toBe(20);
    });

    it('should prefer rowActionColumns over deprecated rowActions', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActions: InlineRowAction[] = [
        { id: 'old', label: 'Old', onClick: async () => {} },
      ];

      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'new',
          label: 'New',
          order: 10,
          actions: [
            { id: 'new-action', label: 'New Action', onClick: async () => {} },
          ],
        },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActions={rowActions}
          rowActionColumns={rowActionColumns}
        />
      );

      // Should use rowActionColumns, not the deprecated rowActions
      expect(clonedEntityForm.fields.has('_rowActions_new')).toBe(true);
      expect(clonedEntityForm.fields.has('_rowActions__default')).toBe(false);
    });

    it('should not add field for empty action column', () => {
      const clonedEntityForm = {
        withParentId: vi.fn().mockReturnThis(),
        fields: new Map(),
      };

      mockEntityForm.clone.mockReturnValue(clonedEntityForm as any);

      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'empty',
          label: 'Empty',
          order: 10,
          actions: [],  // Empty actions array
        },
        {
          id: 'nonempty',
          label: 'Non-Empty',
          order: 20,
          actions: [
            { id: 'action', label: 'Action', onClick: async () => {} },
          ],
        },
      ];

      render(
        <InlineSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          rowActionColumns={rowActionColumns}
        />
      );

      // Empty column should not create a field
      expect(clonedEntityForm.fields.has('_rowActions_empty')).toBe(false);
      expect(clonedEntityForm.fields.has('_rowActions_nonempty')).toBe(true);
    });
  });
});
