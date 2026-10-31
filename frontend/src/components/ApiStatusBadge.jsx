import { useEffect } from "react";
import { useApi } from "../hooks/useApi";

const CHECK_EVERY_MS = 30000;

// Small badge in the top bar showing whether the backend and database respond.
// Clicking it re-checks the connection straight away.
export default function ApiStatusBadge() {
  const { data, error, loading, refetch } = useApi("/api/health");

  useEffect(() => {
    const timer = setInterval(refetch, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [refetch]);

  let state = "checking";
  let label = "CHECKING API";
  let title = "Checking the backend connection...";

  if (error) {
    state = "offline";
    label = "API OFFLINE";
    title = `${error.message} Click to retry.`;
  } else if (data?.status === "ok") {
    state = "online";
    label = "API CONNECTED";
    title = `Connected to database "${data.database}". Click to re-check.`;
  }

  return (
    <button
      type="button"
      className={`data-badge status-badge is-${state}`}
      onClick={refetch}
      title={title}
      aria-live="polite"
      disabled={loading && state === "checking"}
    >
      <span /> {label}
    </button>
  );
}