import { useEffect, useRef, useCallback } from 'react';

// Throttle function implementation
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

interface ScrollOptimizationOptions {
  throttleMs?: number;
  rootMargin?: string;
  threshold?: number | number[];
  enableIntersectionObserver?: boolean;
}

export const useScrollOptimization = (options: ScrollOptimizationOptions = {}) => {
  const {
    throttleMs = 16, // ~60fps
    rootMargin = '50px',
    threshold = 0.1,
    enableIntersectionObserver = true
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<Element>>(new Set());
  const scrollCallbacksRef = useRef<Set<() => void>>(new Set());

  // Throttled scroll handler
  const throttledScrollHandler = useCallback(
    throttle(() => {
      scrollCallbacksRef.current.forEach(callback => callback());
    }, throttleMs),
    [throttleMs]
  );

  // Initialize Intersection Observer
  useEffect(() => {
    if (!enableIntersectionObserver) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            element.style.willChange = 'transform';
            element.classList.add('scroll-optimized');
          } else {
            element.style.willChange = 'auto';
            element.classList.remove('scroll-optimized');
          }
        });
      },
      {
        rootMargin,
        threshold
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [rootMargin, threshold, enableIntersectionObserver]);

  // Observe element
  const observeElement = useCallback((element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
      elementsRef.current.add(element);
    }
  }, []);

  // Unobserve element
  const unobserveElement = useCallback((element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  }, []);

  // Add scroll callback
  const addScrollCallback = useCallback((callback: () => void) => {
    scrollCallbacksRef.current.add(callback);
  }, []);

  // Remove scroll callback
  const removeScrollCallback = useCallback((callback: () => void) => {
    scrollCallbacksRef.current.delete(callback);
  }, []);

  // Setup scroll listener
  useEffect(() => {
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
    };
  }, [throttledScrollHandler]);

  return {
    observeElement,
    unobserveElement,
    addScrollCallback,
    removeScrollCallback,
    throttledScrollHandler
  };
};

// Hook para elementos virtualizados
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const scrollTopRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useCallback(() => {
    const scrollTop = scrollTopRef.current;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
      visibleItems: items.slice(
        Math.max(0, startIndex - overscan),
        endIndex + 1
      )
    };
  }, [items, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    scrollTopRef.current = e.currentTarget.scrollTop;
  }, []);

  return {
    containerRef,
    visibleRange: visibleRange(),
    handleScroll,
    totalHeight: items.length * itemHeight
  };
};
