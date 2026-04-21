'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SyncTopScrollbarProps {
  /** Target element ref to sync scroll with */
  targetRef: React.RefObject<HTMLDivElement | null>;
  /** Minimum content width to show scrollbar (default: 0, always show if scrollable) */
  minWidthToShow?: number;
  /** Additional className for the scrollbar container */
  className?: string;
}

/**
 * Synchronized top scrollbar component
 *
 * Creates a scrollbar at the top of the table that syncs with the bottom scrollbar.
 * This improves UX for long lists where users would otherwise need to scroll
 * down to access the horizontal scrollbar.
 */
export const SyncTopScrollbar: React.FC<SyncTopScrollbarProps> = ({
  targetRef,
  minWidthToShow = 0,
  className = '',
}) => {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isSyncing = useRef(false);

  // Update dimensions and visibility
  const updateDimensions = useCallback(() => {
    if (!targetRef.current) return;

    const scrollWidth = targetRef.current.scrollWidth;
    const clientWidth = targetRef.current.clientWidth;

    setContentWidth(scrollWidth);
    setContainerWidth(clientWidth);

    // Show only if content is wider than container and meets minimum width
    const shouldShow = scrollWidth > clientWidth && scrollWidth >= minWidthToShow;
    setIsVisible(shouldShow);
  }, [targetRef, minWidthToShow]);

  // Observe target element for size changes
  useEffect(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(target);

    // Also observe the table inside for content changes
    const table = target.querySelector('table');
    if (table) {
      resizeObserver.observe(table);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [targetRef, updateDimensions]);

  // Sync scroll from top to target
  const handleTopScroll = useCallback(() => {
    if (isSyncing.current || !targetRef.current || !topScrollRef.current) return;

    isSyncing.current = true;
    targetRef.current.scrollLeft = topScrollRef.current.scrollLeft;

    // Reset sync flag after a short delay
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  }, [targetRef]);

  // Sync scroll from target to top
  useEffect(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;

    const handleTargetScroll = () => {
      if (isSyncing.current || !topScrollRef.current) return;

      isSyncing.current = true;
      topScrollRef.current.scrollLeft = target.scrollLeft;

      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    };

    target.addEventListener('scroll', handleTargetScroll);

    return () => {
      target.removeEventListener('scroll', handleTargetScroll);
    };
  }, [targetRef]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={topScrollRef}
      onScroll={handleTopScroll}
      className={`overflow-x-auto overflow-y-hidden ${className}`}
      style={{
        height: '12px',
        marginBottom: '4px',
      }}
    >
      <div
        style={{
          width: contentWidth,
          height: '1px',
        }}
      />
    </div>
  );
};
