// Central place for talking to the FastAPI backend.
// Every panel uses apiGet(), so URL handling and error messages live here only.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export async function apiGet(path, params, signal) {
  let response;

  try {
    response = await fetch(buildUrl(path, params), {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Cannot reach the API. Check that the backend is running on port 8000."
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // The response had no JSON body (for example a proxy error).
    }

    throw new ApiError(
      detail ||
        `The API returned an error (HTTP ${response.status}). Check that the backend is running on port 8000.`,
      response.status
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("The API returned data in an unexpected format.");
  }
}