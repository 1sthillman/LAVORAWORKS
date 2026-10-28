import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
  threshold?: number; // milliseconds
}

export const useLongPress = (
  callback: () => void,
  options: UseLongPressOptions = {}
) => {
  const { onStart, onFinish, onCancel, threshold = 1200 } = options;
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    onStart?.();
    
    // Progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / threshold) * 100, 100);
      setProgress(progress);
    }, 16); // ~60fps

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setProgress(100);
      onFinish?.();
      callback();
      clear();
    }, threshold);
  }, [callback, threshold, onStart, onFinish]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (!isLongPressRef.current && progress > 0) {
      onCancel?.();
    }
    setProgress(0);
  }, [progress, onCancel]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    progress,
  };
};
