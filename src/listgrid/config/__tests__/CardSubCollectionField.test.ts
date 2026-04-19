import { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { CardSubCollectionField } from '../CardSubCollectionField';
import { EntityForm } from '../EntityForm';

// Mock SubCollectionField's ViewListGrid import
vi.mock('../../components/list/ViewListGrid', () => ({
  ViewListGrid: vi.fn(() => null),
}));

// Mock EntityForm
vi.mock('../EntityForm');

describe('CardSubCollectionField', () => {
  let mockEntityForm: any;
  let mockParentEntityForm: any;

  beforeEach(() => {
    mockEntityForm = {
      id: 'test-entity-form',
      clone: vi.fn(),
      getValue: vi.fn(),
      getUrl: vi.fn().mockReturnValue('http://api.example.com/items'),
    } as any;

    mockParentEntityForm = {
      id: 'parent-123',
      clone: vi.fn(),
      getValue: vi.fn(),
      getUrl: vi.fn().mockReturnValue('http://api.example.com/parent'),
    } as any;
  });

  describe('constructor', () => {
    it('should create CardSubCollectionField with required props', () => {
      const relation = {
        mappedBy: 'parentId',
        filterBy: 'parent.id',
      };

      const field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
        label: 'Items',
      });

      expect(field.name).toBe('items');
      expect(field.order).toBe(1);
      expect(field.relation).toEqual(relation);
      expect(field.fetchUrl).toBe('http://api.example.com/items');
    });

    it('should support function-based fetchUrl when useSearchForm is false', () => {
      const relation = {
        mappedBy: 'parentId',
      };

      const dynamicFetchUrl = (parentForm: EntityForm) =>
        `http://api.example.com/parent/${parentForm.id}/items`;

      const field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: dynamicFetchUrl,
        // Must set useSearchForm: false to enable function-based URL
        fetchOptions: { useSearchForm: false },
      });

      // fetchUrl defaults to entityForm.getUrl(), but fetchUrlFunction stores the dynamic function
      expect(field.fetchUrlFunction).toBe(dynamicFetchUrl);
      expect(field.fetchUrl).toBe('http://api.example.com/items'); // from mockEntityForm.getUrl()
    });

    it('should ignore function-based fetchUrl when useSearchForm is true (default)', () => {
      const relation = {
        mappedBy: 'parentId',
      };

      const dynamicFetchUrl = (parentForm: EntityForm) =>
        `http://api.example.com/parent/${parentForm.id}/items`;

      const field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: dynamicFetchUrl,
        // useSearchForm defaults to true, so fetchUrlFunction is not set
      });

      // When useSearchForm is true, fetchUrlFunction is not stored
      expect(field.fetchUrlFunction).toBeUndefined();
      // fetchUrl is set from entityForm.getUrl()
      expect(field.fetchUrl).toBe('http://api.example.com/items');
    });

    it('should set default cardConfig values with number columns', () => {
      const relation = {
        mappedBy: 'parentId',
      };

      const field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
        cardConfig: {
          columns: 2, // number format: field columns only
        },
      });

      expect(field.cardConfig?.columns).toBe(2);
    });

    it('should set default cardConfig values with object columns', () => {
      const relation = {
        mappedBy: 'parentId',
      };

      const field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
        cardConfig: {
          columns: { card: 3, field: 2 }, // object format: explicit card and field columns
        },
      });

      expect(field.cardConfig?.columns).toEqual({ card: 3, field: 2 });
    });
  });

  describe('EntityItem interface implementation', () => {
    const relation = { mappedBy: 'parentId' };
    let field: CardSubCollectionField;

    beforeEach(() => {
      field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
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

    it('should implement clone', () => {
      const cloned = field.clone();
      expect(cloned.name).toBe('items');
      expect(cloned.order).toBe(1);
      expect(cloned.relation).toEqual(relation);
    });

    it('should support withOrder', () => {
      const modified = field.withOrder(5);
      expect(modified.order).toBe(5);
    });

    it('should support withLabel', () => {
      const modified = field.withLabel('Custom Items');
      expect(modified.label).toBe('Custom Items');
    });

    it('should support withHidden', () => {
      const modified = field.withHidden(true);
      expect(modified.hidden).toBe(true);
    });

    it('should support withReadOnly', () => {
      const modified = field.withReadOnly(true);
      expect(modified.readonly).toBe(true);
    });
  });

  describe('render method', () => {
    const relation = { mappedBy: 'parentId' };
    let field: CardSubCollectionField;

    beforeEach(() => {
      field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
        cardConfig: {
          columns: 3,
          displayFields: ['name', 'description'],
          titleField: 'name',
        },
      });
    });

    it('should render CardSubCollectionView component', async () => {
      const result = await field.render({
        entityForm: mockParentEntityForm,
      });

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should handle dynamic fetchUrl', async () => {
      const dynamicField = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: (parentForm) => `http://api.example.com/parent/${parentForm.id}/items`,
      });

      const result = await dynamicField.render({
        entityForm: mockParentEntityForm,
      });

      expect(result).toBeDefined();
    });

    it('should pass cardConfig to rendered component', async () => {
      const cardConfig = {
        columns: 4,
        titleField: 'title',
        displayFields: ['name', 'status'],
      };

      const configuredField = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
        cardConfig,
      });

      const result = await configuredField.render({
        entityForm: mockParentEntityForm,
      });

      expect(result).toBeDefined();
    });
  });

  describe('chain builder pattern', () => {
    const relation = { mappedBy: 'parentId' };
    let field: CardSubCollectionField;

    beforeEach(() => {
      field = new CardSubCollectionField({
        entityForm: mockEntityForm,
        relation,
        order: 1,
        name: 'items',
        fetchUrl: 'http://api.example.com/items',
      });
    });

    it('should support chained configuration', () => {
      const configured = field
        .withLabel('Custom Items')
        .withOrder(2)
        .withHidden(false)
        .withReadOnly(true);

      expect(configured.label).toBe('Custom Items');
      expect(configured.order).toBe(2);
      expect(configured.hidden).toBe(false);
      expect(configured.readonly).toBe(true);
    });
  });
});
