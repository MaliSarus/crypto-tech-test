function throttle<T extends (...args: any[]) => void>(func: T, limit: number) {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number | undefined;

  return function (...args: Parameters<T>) {
    // @ts-ignore
    const context = this;

    const now = Date.now();
    if (lastRan === undefined || now - lastRan >= limit) {
      func.apply(context, args);
      lastRan = now;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (lastRan !== undefined && (Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (now - lastRan));
    }
  };
}

/**
 * A custom hook for implementing infinite scroll functionality.
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
export default function useInfiniteScroll(params: {
  callback?: (() => Promise<void>) | (() => void);
  useCallbackOnInit?: boolean;
  delay?: number;
}) {
  const {
    callback = () => { },
    useCallbackOnInit = true,
    delay = 1000
  } = params;
  let throttledFunction: () => void;
  const elementIsWindow = (element?: HTMLElement | Window) => !element || 'innerHeight' in element

  const init = (element?: HTMLElement | Window) => {
    if (useCallbackOnInit)
      callback()

    const scrollListenerFunction = () => {
      let isScrolledToBottom:boolean;
      if (!elementIsWindow(element))
        isScrolledToBottom = element.scrollHeight === element.offsetHeight + element.scrollTop
      else
        isScrolledToBottom = document.documentElement.scrollHeight - 1 <= window.innerHeight + window.scrollY
      if (isScrolledToBottom) {
        callback()
      }
    }

    throttledFunction = throttle(scrollListenerFunction, delay)
    if (!elementIsWindow(element)) element.addEventListener('scroll', throttledFunction, { passive: true, capture: false })
    else window.addEventListener('scroll', throttledFunction, { passive: true, capture: false })
  }

  const uninit = (element?: HTMLElement | Window) => {
    if (!elementIsWindow(element))
      element.removeEventListener('scroll', throttledFunction);
    else
      window.removeEventListener('scroll', throttledFunction);
  }

  return {
    init,
    uninit
  };
}