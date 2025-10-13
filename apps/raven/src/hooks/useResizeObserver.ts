import { useEffect, useRef } from "react";

export const useResizeObserver = (callback: (height: number) => void) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      callback(entries[0].contentRect.height);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [callback]);

  return elementRef;
};
