import { useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash";

export const useDebounce = (callback: DebounceCallback) => {
  const ref = useRef<DebounceCallback>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useMemo(() => {
    const func = () => ref.current?.();

    return debounce(func, 500);
  }, []);
};

type DebounceCallback = () => void;
