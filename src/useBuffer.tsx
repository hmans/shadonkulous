import { useMemo } from "react";

export const useBuffer = (
  count: number,
  factory: () => [number, number, number]
) =>
  useMemo(() => {
    const a = new Float32Array(3 * count);
    const l = count;

    for (let i = 0; i < l; i++) {
      const offset = i * 3;
      const r = factory();
      a[offset + 0] = r[0];
      a[offset + 1] = r[1];
      a[offset + 2] = r[2];
    }

    return a;
  }, [count]);
