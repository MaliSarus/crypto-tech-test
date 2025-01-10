function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (lastRan === null || now - lastRan >= limit) {
      func(...args);
      lastRan = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          func(...args);
          lastRan = Date.now();
        },
        limit - (now - lastRan),
      );
    }
  };
}

/**
 * Hook for implementing infinite scroll functionality.
 *
 * @param params - The parameters for the infinite scroll hook.
 * @param params.callback - A callback function to be called when the user scrolls to the bottom.
 *                          It can be a synchronous or asynchronous function.
 * @param params.useCallbackOnInit - A boolean indicating whether to call the callback immediately on initialization.
 * @param params.delay - The delay in milliseconds for throttling the scroll event.
 *
 * @returns An object containing the `init` and `uninit` methods to manage the scroll event listener.
 *
 * @example
 * const { init, uninit } = useInfiniteScroll({
 *   callback: () => {
 *     console.log('Scrolled to bottom!');
 *   },
 *   useCallbackOnInit: true,
 *   delay: 1000,
 * });
 *
 * // Initialize the infinite scroll on a specific element
 * init(document.getElementById('scrollableElement'));
 *
 * // Cleanup when no longer needed
 * uninit(document.getElementById('scrollableElement'));
 */
type InfiniteScrollCallback = (() => Promise<void>) | (() => void);

export default function useInfiniteScroll(params: {
  callback?: InfiniteScrollCallback;
  useCallbackOnInit?: boolean;
  delay?: number;
}) {
  const {
    callback = () => {},
    useCallbackOnInit = true,
    delay = 1000,
  } = params;
  let scrollElement: HTMLElement | Window | null = null;
  let isAttached = false;

  const handleScroll = () => {
    if (!scrollElement) return;
    console.log('scroll');

    const target =
      scrollElement instanceof Window
        ? document.documentElement
        : scrollElement;

    const scrollTop =
      scrollElement instanceof Window ? window.scrollY : target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 1) {
      callback();
    }
  };

  const throttledScrollHandler = throttle(handleScroll, delay);

  const init = (element: HTMLElement | Window = window) => {
    if (isAttached) {
      console.warn('Infinite scroll already initialized.');
      return;
    }
    if (useCallbackOnInit) callback();

    scrollElement = element;

    scrollElement.addEventListener('scroll', throttledScrollHandler, {
      passive: true,
      capture: false,
    });
    isAttached = true;
  };

  const uninit = () => {
    if (!isAttached || !scrollElement) {
      return;
    }

    scrollElement.removeEventListener('scroll', throttledScrollHandler);
    scrollElement = null;
    isAttached = false;
  };

  return { init, uninit };
}
