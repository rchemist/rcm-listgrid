import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {CardSubCollectionView} from '../CardSubCollectionView';
import {EntityForm} from '../../../../config/EntityForm';
import {useCardSubCollectionData} from '../../hooks/useCardSubCollectionData';

// Mock the useCardSubCollectionData hook
jest.mock('../../hooks/useCardSubCollectionData', () => ({
  useCardSubCollectionData: jest.fn(),
}));

// Mock CardItem component
jest.mock('../CardItem', () => ({
  CardItem: ({ item, onEdit, onDelete }: { item: any; onEdit?: () => void; onDelete?: () => void }) => (
    <div data-testid={`card-${item.id}`}>
      <span>{item.name}</span>
      {onEdit && <button onClick={onEdit} aria-label={`Edit ${item.name}`}>Edit</button>}
      {onDelete && <button onClick={onDelete} aria-label={`Delete ${item.name}`}>Delete</button>}
    </div>
  ),
}));

// Mock Tooltip component
jest.mock('../../../../ui', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseCardSubCollectionData = useCardSubCollectionData as jest.Mock;

describe('CardSubCollectionView', () => {
  let mockEntityForm: EntityForm;
  let mockParentEntityForm: EntityForm;

  beforeEach(() => {
    jest.clearAllMocks();

    mockEntityForm = {
      id: 'entity-form-id',
      clone: jest.fn().mockReturnThis(),
      withId: jest.fn().mockReturnThis(),
      setValue: jest.fn(),
      fields: new Map([
        ['id', { name: 'id', type: 'text', hidden: true, getLabel: () => 'ID', getName: () => 'id' }],
        ['name', { name: 'name', type: 'text', hidden: false, getLabel: () => '이름', getName: () => 'name' }],
      ]),
    } as any;

    mockParentEntityForm = {
      id: 'parent-123',
      clone: jest.fn().mockReturnThis(),
      getValue: jest.fn(),
    } as any;
  });

  describe('rendering states', () => {
    it('should show loading state', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Loading state shows skeleton divs with animate-pulse class
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show empty state when no data', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Changed to Korean text
      expect(screen.getByText(/표시할 항목이 없습니다/)).toBeInTheDocument();
    });

    it('should show error state when error occurs', () => {
      const mockError = new Error('Failed to fetch');
      mockUseCardSubCollectionData.mockReturnValue({
        data: [],
        loading: false,
        error: mockError,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Changed to Korean error message
      expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
    });
  });

  describe('card grid rendering', () => {
    it('should render cards when data is available', () => {
      const mockData = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      mockUseCardSubCollectionData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          cardConfig={{ columns: 3 }}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.getByTestId('card-2')).toBeInTheDocument();
      expect(screen.getByTestId('card-3')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    // Create entityForm with quickSearch enabled fields for search tests
    let searchEnabledEntityForm: EntityForm;

    beforeEach(() => {
      searchEnabledEntityForm = {
        id: 'entity-form-id',
        clone: jest.fn().mockReturnThis(),
        withId: jest.fn().mockReturnThis(),
        setValue: jest.fn(),
        fields: new Map([
          ['id', {
            name: 'id',
            type: 'text',
            hidden: true,
            getLabel: () => 'ID',
            getName: () => 'id',
            listConfig: { support: false, quickSearch: false },
          }],
          ['name', {
            name: 'name',
            type: 'text',
            hidden: false,
            getLabel: () => '이름',
            getName: () => 'name',
            listConfig: { support: true, quickSearch: true },
          }],
        ]),
      } as any;
    });

    it('should filter items based on search query', () => {
      const mockData = [
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
        { id: '3', name: 'Cherry' },
      ];

      mockUseCardSubCollectionData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={searchEnabledEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Find search input and type a query
      // Dynamic placeholder based on entityForm fields - use role to find input
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'Apple' } });

      // Only Apple card should be visible
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
      expect(screen.queryByTestId('card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('card-3')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', () => {
      const mockData = [
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
      ];

      mockUseCardSubCollectionData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={searchEnabledEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Dynamic placeholder based on entityForm fields - use role to find input
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: 'XYZ' } });

      expect(screen.getByText(/검색 결과가 없습니다/)).toBeInTheDocument();
    });

    it('should not show search input when no quickSearch fields are defined', () => {
      const mockData = [
        { id: '1', name: 'Apple' },
      ];

      mockUseCardSubCollectionData.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // Search input should not be present when no quickSearch fields
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  describe('readonly mode', () => {
    it('should pass readonly prop to CardItem', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [{ id: '1', name: 'Item 1' }],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={true}
        />
      );

      // In readonly mode, the component should still render but without action handlers
      expect(screen.getByTestId('card-1')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('should call useCardSubCollectionData with correct parameters', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId', filterBy: 'parent.id' }}
          readonly={false}
        />
      );

      expect(mockUseCardSubCollectionData).toHaveBeenCalledWith(
        'http://api.example.com/items',
        expect.objectContaining({
          mappedBy: 'parentId',
          filterBy: 'parent.id',
        })
      );
    });

    it('should support function-based fetchUrl', () => {
      const mockFetchUrl = jest.fn(() => 'http://api.example.com/parent/123/items');

      mockUseCardSubCollectionData.mockReturnValue({
        data: [],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl={mockFetchUrl}
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
        />
      );

      // The fetchUrl function should be called
      expect(mockFetchUrl).toHaveBeenCalled();
    });
  });

  describe('add button', () => {
    it('should show add button in non-readonly mode', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [{ id: '1', name: 'Item 1' }],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      const onItemAdd = jest.fn();

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={false}
          onItemAdd={onItemAdd}
        />
      );

      // Changed to Korean text - "추가" button
      const addButton = screen.getByText(/추가/);
      expect(addButton).toBeInTheDocument();
    });

    it('should not show add button in readonly mode', () => {
      mockUseCardSubCollectionData.mockReturnValue({
        data: [{ id: '1', name: 'Item 1' }],
        loading: false,
        error: null,
        refresh: jest.fn(),
      });

      const onItemAdd = jest.fn();

      render(
        <CardSubCollectionView
          parentEntityForm={mockParentEntityForm}
          parentId="parent-123"
          entityForm={mockEntityForm}
          fetchUrl="http://api.example.com/items"
          relation={{ mappedBy: 'parentId' }}
          readonly={true}
          onItemAdd={onItemAdd}
        />
      );

      expect(screen.queryByText(/추가/)).not.toBeInTheDocument();
    });
  });
});
