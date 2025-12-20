type ScrollToTopListener = () => void;

const listeners: Set<ScrollToTopListener> = new Set();

export function addScrollToTopListener(listener: ScrollToTopListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function triggerScrollToTop() {
  for (const listener of listeners) {
    listener();
  }
}
