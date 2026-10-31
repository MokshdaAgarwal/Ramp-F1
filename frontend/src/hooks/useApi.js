import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api/client";

// Loads data from the API and reports loading / error / data states.
//
//   const { data, error, loading, refetch } = useApi("/api/pit-stops");
//   const laps = useApi("/api/laps", { driver_code: "VER", limit: 1000 });
//
// Pass null as the path to skip the request (useful before a filter is chosen).
export function useApi(path, params) {
  const paramsKey = JSON.stringify(params ?? {});
  const baseKey = `${path}|${paramsKey}`;

  const [tick, setTick] = useState(0);
  const requestKey = `${baseKey}|${tick}`;
  const [result, setResult] = useState({
    requestKey: null,
    baseKey: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!path) return undefined;

    const controller = new AbortController();

    apiGet(path, JSON.parse(paramsKey), controller.signal)
      .then((data) => {
        setResult({ requestKey, baseKey, data, error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setResult({ requestKey, baseKey, data: null, error });
      });

    return () => controller.abort();
  }, [path, paramsKey, requestKey, baseKey]);

  const refetch = useCallback(() => setTick((value) => value + 1), []);

  // Only show results that belong to the current path and filters.
  const isCurrent = result.baseKey === baseKey;

  return {
    data: isCurrent ? result.data : null,
    error: isCurrent ? result.error : null,
    loading: Boolean(path) && result.requestKey !== requestKey,
    refetch,
  };
}