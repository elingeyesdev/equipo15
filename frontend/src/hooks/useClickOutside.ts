import { useEffect, useRef } from 'react';

/**
 * useClickOutside
 *
 * Fires `handler` whenever the user clicks/touches outside
 * the element referenced by the returned `ref`.
 *
 * The listener is automatically removed when the component unmounts.
 *
 * @example
 * const containerRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
 * <div ref={containerRef}>…</div>
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  active = true,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      // Fire handler only when click is OUTSIDE the element
      if (!el || el.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, active]);

  return ref;
}
