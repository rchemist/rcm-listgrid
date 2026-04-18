import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import {
  InlineListFieldConfig,
  InlineRowAction,
  InlineRowActionColumn,
  InlineRowActionsConfig,
  InlineSubCollectionField
} from '../InlineSubCollectionField';
import {EntityForm} from '../EntityForm';

// Mock SubCollectionField's ViewListGrid import
vi.mock('../../components/list/ViewListGrid', () => ({
  ViewListGrid: vi.fn(() => null),
}));

// Mock EntityForm
vi.mock('../EntityForm');

describe('InlineSubCollectionField', () => {
  let mockEntityForm: any;
  let mockParentEntityForm: any;

  beforeEach(() => {
    mockEntityForm = {
      id: 'test-entity-form',
      clone: vi.fn().mockReturnThis(),
      withParentId: vi.fn().mockReturnThis(),
      getValue: vi.fn(),
      getUrl: vi.fn().mockReturnValue('http://api.example.com/items'),
      fields: new Map(),
    } as any;

    mockParentEntityForm = {
      id: 'parent-123',
      clone: vi.fn().mockReturnThis(),
      getValue: vi.fn(),
      getUrl: vi.fn().mockReturnValue('http://api.example.com/parent'),
    } as any;
  });

  describe('constructor', () => {
    it('should create InlineSubCollectionField with required props', () => {
      const relation = {
        mappedBy: 'parentId',
        filterBy: 'parent.id',
      };

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        label: 'Items',
      });

      expect(field.name).toBe('items');
      expect(field.order).toBe(1);
      expect(field.relation).toEqual(relation);
    });

    it('should set default fetchOptions', () => {
      const relation = { mappedBy: 'parentId' };

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      expect(field.fetchOptions).toBeDefined();
      expect(field.fetchOptions?.useSearchForm).toBe(true);
      expect(field.fetchOptions?.viewDetail).toBe(false);
      expect(field.fetchOptions?.pageSize).toBe(10);
    });

    it('should accept custom fetchOptions', () => {
      const relation = { mappedBy: 'parentId' };

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchOptions: {
          useSearchForm: false,
          viewDetail: true,
          pageSize: 20,
        },
      });

      expect(field.fetchOptions?.useSearchForm).toBe(false);
      expect(field.fetchOptions?.viewDetail).toBe(true);
      expect(field.fetchOptions?.pageSize).toBe(20);
    });
  });

  describe('listFields configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept string array for listFields', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        listFields: ['name', 'status', 'createdAt'],
      });

      expect(field.inlineListFields).toEqual(['name', 'status', 'createdAt']);
    });

    it('should accept InlineListFieldConfig array for listFields', () => {
      const listFields: InlineListFieldConfig[] = [
        { name: 'name', listConfig: { filterable: false } },
        { name: 'status', listConfig: { sortable: true } },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        listFields,
      });

      expect(field.inlineListFields).toEqual(listFields);
    });

    it('should support withListFields method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const modified = field.withListFields('name', 'status');
      expect(modified.inlineListFields).toEqual(['name', 'status']);
    });
  });

  describe('rowActions configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept rowActions array', () => {
      const rowActions: InlineRowAction[] = [
        {
          id: 'edit',
          label: '수정',
          onClick: async () => {},
        },
        {
          id: 'delete',
          label: '삭제',
          onClick: async () => {},
          confirm: '정말 삭제하시겠습니까?',
        },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActions,
      });

      expect(field.inlineRowActions).toEqual(rowActions);
      expect(field.inlineRowActions?.length).toBe(2);
    });

    it('should support withRowActions method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const action: InlineRowAction = {
        id: 'test',
        label: 'Test',
        onClick: async () => {},
      };

      const modified = field.withRowActions(action);
      expect(modified.inlineRowActions).toEqual([action]);
    });

    it('should support rowAction with dynamic label', () => {
      const dynamicLabel = (item: any) => `Edit ${item.name}`;

      const rowActions: InlineRowAction[] = [
        {
          id: 'edit',
          label: dynamicLabel,
          onClick: async () => {},
        },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActions,
      });

      expect(field.inlineRowActions?.[0].label).toBe(dynamicLabel);
    });

    it('should support rowAction with disabled and hidden functions', () => {
      const rowActions: InlineRowAction[] = [
        {
          id: 'edit',
          label: '수정',
          onClick: async () => {},
          disabled: (item) => item.locked === true,
          hidden: (item) => item.deleted === true,
        },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActions,
      });

      expect(field.inlineRowActions?.[0].disabled).toBeDefined();
      expect(field.inlineRowActions?.[0].hidden).toBeDefined();
    });
  });

  describe('rowActionsConfig configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept rowActionsConfig', () => {
      const rowActionsConfig: InlineRowActionsConfig = {
        order: 1,
        label: '관리',
      };

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActionsConfig,
      });

      expect(field.inlineRowActionsConfig).toEqual(rowActionsConfig);
    });

    it('should support withRowActionsConfig method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const config: InlineRowActionsConfig = { order: 5, label: '액션' };
      const modified = field.withRowActionsConfig(config);

      expect(modified.inlineRowActionsConfig).toEqual(config);
    });

    it('should allow partial rowActionsConfig', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActionsConfig: { order: 2 }, // only order, no label
      });

      expect(field.inlineRowActionsConfig?.order).toBe(2);
      expect(field.inlineRowActionsConfig?.label).toBeUndefined();
    });
  });

  describe('pagination configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept pagination options', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        pagination: {
          pageSize: 20,
          clientSide: true,
        },
      });

      expect(field.inlinePagination?.pageSize).toBe(20);
      expect(field.inlinePagination?.clientSide).toBe(true);
    });

    it('should support withPagination method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const modified = field.withPagination({ pageSize: 50 });
      expect(modified.inlinePagination?.pageSize).toBe(50);
    });

    it('should use pagination pageSize for fetchOptions when not explicitly set', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        pagination: { pageSize: 25 },
      });

      expect(field.fetchOptions?.pageSize).toBe(25);
    });
  });

  describe('globalListConfig configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept globalListConfig', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        globalListConfig: {
          filterable: false,
          sortable: true,
          quickSearch: false,
        },
      });

      expect(field.inlineGlobalListConfig?.filterable).toBe(false);
      expect(field.inlineGlobalListConfig?.sortable).toBe(true);
      expect(field.inlineGlobalListConfig?.quickSearch).toBe(false);
    });

    it('should support withGlobalListConfig method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const modified = field.withGlobalListConfig({ filterable: false });
      expect(modified.inlineGlobalListConfig?.filterable).toBe(false);
    });
  });

  describe('hideTitle configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept hideTitle option', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        hideTitle: true,
      });

      expect(field.hideTitle).toBe(true);
    });

    it('should support withHideTitle method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const modified = field.withHideTitle(true);
      expect(modified.hideTitle).toBe(true);
    });

    it('should default to true when withHideTitle is called without argument', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const modified = field.withHideTitle();
      expect(modified.hideTitle).toBe(true);
    });
  });

  describe('clone method', () => {
    const relation = { mappedBy: 'parentId' };

    it('should clone all properties correctly', () => {
      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        label: 'Items',
        listFields: ['name', 'status'],
        rowActions,
        rowActionsConfig: { order: 2, label: '관리' },
        pagination: { pageSize: 15 },
        globalListConfig: { filterable: false },
        hideTitle: true,
      });

      const cloned = field.clone();

      expect(cloned.name).toBe('items');
      expect(cloned.order).toBe(1);
      expect(cloned.relation).toEqual(relation);
      expect(cloned.inlineListFields).toEqual(['name', 'status']);
      expect(cloned.inlineRowActions).toEqual(rowActions);
      expect(cloned.inlineRowActionsConfig).toEqual({ order: 2, label: '관리' });
      expect(cloned.inlinePagination?.pageSize).toBe(15);
      expect(cloned.inlineGlobalListConfig?.filterable).toBe(false);
      expect(cloned.hideTitle).toBe(true);
    });

    it('should create independent clone', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        listFields: ['name'],
      });

      const cloned = field.clone();
      cloned.withListFields('name', 'status', 'createdAt');

      // Original should not be affected
      expect(field.inlineListFields).toEqual(['name']);
    });
  });

  describe('rowActionColumns configuration', () => {
    const relation = { mappedBy: 'parentId' };

    it('should accept rowActionColumns array', () => {
      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'management',
          label: '관리',
          order: 100,
          actions: [
            { id: 'edit', label: '수정', onClick: async () => {} },
            { id: 'delete', label: '삭제', onClick: async () => {} },
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

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActionColumns,
      });

      expect(field.inlineRowActionColumns).toEqual(rowActionColumns);
      expect(field.inlineRowActionColumns?.length).toBe(2);
    });

    it('should support withRowActionColumns method', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const columns: InlineRowActionColumn[] = [
        {
          id: 'actions',
          label: '액션',
          order: 50,
          actions: [
            { id: 'test', label: 'Test', onClick: async () => {} },
          ],
        },
      ];

      const modified = field.withRowActionColumns(...columns);
      expect(modified.inlineRowActionColumns).toEqual(columns);
    });

    it('should convert deprecated rowActions to rowActionColumns', () => {
      const rowActions: InlineRowAction[] = [
        { id: 'edit', label: '수정', onClick: async () => {} },
        { id: 'delete', label: '삭제', onClick: async () => {} },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActions,
        rowActionsConfig: { order: 5, label: '작업' },
      });

      // Should have converted to rowActionColumns
      expect(field.inlineRowActionColumns).toBeDefined();
      expect(field.inlineRowActionColumns?.length).toBe(1);
      expect(field.inlineRowActionColumns?.[0].id).toBe('_default');
      expect(field.inlineRowActionColumns?.[0].label).toBe('작업');
      expect(field.inlineRowActionColumns?.[0].order).toBe(5);
      expect(field.inlineRowActionColumns?.[0].actions).toEqual(rowActions);
    });

    it('should prefer rowActionColumns over deprecated rowActions', () => {
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

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActions,
        rowActionColumns,
      });

      // Should use rowActionColumns, not the converted rowActions
      expect(field.inlineRowActionColumns).toEqual(rowActionColumns);
      expect(field.inlineRowActionColumns?.[0].id).toBe('new');
    });

    it('should clone rowActionColumns correctly', () => {
      const rowActionColumns: InlineRowActionColumn[] = [
        {
          id: 'management',
          label: '관리',
          order: 100,
          actions: [
            { id: 'edit', label: '수정', onClick: async () => {} },
          ],
        },
      ];

      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        rowActionColumns,
      });

      const cloned = field.clone();
      expect(cloned.inlineRowActionColumns).toEqual(rowActionColumns);
    });
  });

  describe('chain builder pattern', () => {
    const relation = { mappedBy: 'parentId' };

    it('should support chained configuration', () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const configured = field
        .withLabel('Custom Items')
        .withOrder(2)
        .withHidden(false)
        .withReadOnly(true)
        .withListFields('name', 'status')
        .withPagination({ pageSize: 25 })
        .withGlobalListConfig({ filterable: false })
        .withRowActionsConfig({ order: 1, label: '액션' })
        .withHideTitle(true);

      expect(configured.label).toBe('Custom Items');
      expect(configured.order).toBe(2);
      expect(configured.hidden).toBe(false);
      expect(configured.readonly).toBe(true);
      expect(configured.inlineListFields).toEqual(['name', 'status']);
      expect(configured.inlinePagination?.pageSize).toBe(25);
      expect(configured.inlineGlobalListConfig?.filterable).toBe(false);
      expect(configured.inlineRowActionsConfig).toEqual({ order: 1, label: '액션' });
      expect(configured.hideTitle).toBe(true);
    });
  });

  describe('EntityItem interface implementation', () => {
    const relation = { mappedBy: 'parentId' };
    let field: InlineSubCollectionField;

    beforeEach(() => {
      field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        label: 'Items',
      });
    });

    it('should implement getOrder', () => {
      expect(field.getOrder()).toBe(1);
    });

    it('should implement getName', () => {
      expect(field.getName()).toBe('items');
    });

    it('should implement getLabel', () => {
      expect(field.getLabel()).toBe('Items');
    });
  });

  describe('render method', () => {
    const relation = { mappedBy: 'parentId' };

    it('should render InlineSubCollectionView component', async () => {
      const field = new InlineSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
      });

      const result = await field.render({
        entityForm: mockParentEntityForm,
      });

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });
  });
});
