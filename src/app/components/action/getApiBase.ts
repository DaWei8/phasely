// API Base Detection
export function getApiBase(): string {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1"
    ? "http://127.0.0.1:5501"
    : "https://phaseplanner-v2.onrender.com";
}