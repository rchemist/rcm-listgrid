import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EntityFormScopeProvider, useEntityFormScope } from './EntityFormScopeContext';

describe('EntityFormScopeContext', () => {
  describe('useEntityFormScope', () => {
    it('should provide default values when not wrapped in provider', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return (
          <div>
            <span data-testid="depth">{scope.depth}</span>
            <span data-testid="maxInlineDepth">{scope.maxInlineDepth}</span>
            <span data-testid="isInlineMode">{String(scope.isInlineMode)}</span>
            <span data-testid="canExpand">{String(scope.canExpand)}</span>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('depth')).toHaveTextContent('0');
      expect(screen.getByTestId('maxInlineDepth')).toHaveTextContent('1');
      expect(screen.getByTestId('isInlineMode')).toHaveTextContent('true');
    });
  });

  describe('EntityFormScopeProvider', () => {
    it('should provide depth from props', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return <span data-testid="depth">{scope.depth}</span>;
      };

      render(
        <EntityFormScopeProvider depth={2}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('depth')).toHaveTextContent('2');
    });

    it('should calculate isInlineMode based on depth and maxInlineDepth', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return <span data-testid="isInlineMode">{String(scope.isInlineMode)}</span>;
      };

      const { rerender } = render(
        <EntityFormScopeProvider depth={0} maxInlineDepth={1}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('isInlineMode')).toHaveTextContent('true');

      rerender(
        <EntityFormScopeProvider depth={2} maxInlineDepth={1}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('isInlineMode')).toHaveTextContent('false');
    });

    it('should provide expansion state methods', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();

        return (
          <div>
            <button
              data-testid="toggleBtn"
              onClick={() => {
                scope.toggleExpansion?.('test-id');
              }}
            >
              Toggle
            </button>
            <button
              data-testid="collapseBtn"
              onClick={() => {
                scope.collapseItem?.('test-id');
              }}
            >
              Collapse
            </button>
            <button
              data-testid="collapseAllBtn"
              onClick={() => {
                scope.collapseAll?.();
              }}
            >
              Collapse All
            </button>
            <span data-testid="expandedCount">{scope.expandedItems?.length || 0}</span>
          </div>
        );
      };

      const { getByTestId } = render(
        <EntityFormScopeProvider depth={0}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(getByTestId('expandedCount')).toHaveTextContent('0');

      // Verify methods are callable
      expect(getByTestId('toggleBtn')).toBeInTheDocument();
      expect(getByTestId('collapseBtn')).toBeInTheDocument();
      expect(getByTestId('collapseAllBtn')).toBeInTheDocument();
    });

    it('should inherit parent scope when nested', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return (
          <div>
            <span data-testid="depth">{scope.depth}</span>
            <span data-testid="maxInlineDepth">{scope.maxInlineDepth}</span>
          </div>
        );
      };

      render(
        <EntityFormScopeProvider depth={0} maxInlineDepth={2}>
          <EntityFormScopeProvider depth={1}>
            <TestComponent />
          </EntityFormScopeProvider>
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('depth')).toHaveTextContent('1');
      expect(screen.getByTestId('maxInlineDepth')).toHaveTextContent('2');
    });

    it('should support custom maxExpandedItems', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return <span data-testid="maxExpanded">{scope.maxExpandedItems}</span>;
      };

      render(
        <EntityFormScopeProvider depth={0} maxExpandedItems={5}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('maxExpanded')).toHaveTextContent('5');
    });

    it('should support expansionMode option', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return <span data-testid="expansionMode">{scope.expansionMode}</span>;
      };

      render(
        <EntityFormScopeProvider depth={0} expansionMode="single">
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('expansionMode')).toHaveTextContent('single');
    });

    it('should provide responsive mode flag', () => {
      const TestComponent = () => {
        const scope = useEntityFormScope();
        return <span data-testid="forceModal">{String(scope.forceModalMode)}</span>;
      };

      render(
        <EntityFormScopeProvider depth={0} forceModalMode={true}>
          <TestComponent />
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('forceModal')).toHaveTextContent('true');
    });
  });

  describe('nesting scenarios', () => {
    it('should handle deeply nested providers', () => {
      const TestComponent = ({ level }: { level: number }) => {
        const scope = useEntityFormScope();
        return <span data-testid={`depth-${level}`}>{scope.depth}</span>;
      };

      render(
        <EntityFormScopeProvider depth={0}>
          <TestComponent level={0} />
          <EntityFormScopeProvider depth={1}>
            <TestComponent level={1} />
            <EntityFormScopeProvider depth={2}>
              <TestComponent level={2} />
            </EntityFormScopeProvider>
          </EntityFormScopeProvider>
        </EntityFormScopeProvider>,
      );

      expect(screen.getByTestId('depth-0')).toHaveTextContent('0');
      expect(screen.getByTestId('depth-1')).toHaveTextContent('1');
      expect(screen.getByTestId('depth-2')).toHaveTextContent('2');
    });
  });
});
