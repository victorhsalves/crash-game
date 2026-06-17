import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

interface UseAnimatedValueOptions {
  from: number;
  to: number;
  durationMs?: number;
  enabled: boolean;
}

export function useAnimatedValue({
  from,
  to,
  durationMs = 1200,
  enabled,
}: UseAnimatedValueOptions): number {
  const [value, setValue] = useState(enabled ? from : to);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(to);
      return;
    }

    setValue(from);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);
      setValue(from + (to - from) * eased);

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [from, to, durationMs, enabled]);

  return value;
}
