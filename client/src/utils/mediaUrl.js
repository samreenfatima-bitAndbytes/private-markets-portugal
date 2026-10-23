/**
 * Resolve GridFS ids or static public paths for the demo (no backend).
 */
export function mediaUrl(idOrPath, fallback = "/property.jpg") {
  if (idOrPath == null || idOrPath === "") return fallback;
  const s = String(idOrPath).replace(/"/g, "");
  if (
    s.startsWith("/") ||
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("blob:") ||
    s.startsWith("data:")
  ) {
    return s;
  }
  // Local avatar / asset filenames stored without leading slash
  if (s.includes("avatars/") || s.includes("demo-props/") || /\.(jpe?g|png|svg|webp)$/i.test(s)) {
    return s.startsWith("/") ? s : `/${s}`;
  }
  const base = import.meta.env.VITE_API_URL;
  const useMock =
    import.meta.env.VITE_USE_MOCK === "true" ||
    !base ||
    base === "mock" ||
    base.startsWith("mock");
  if (useMock) {
    return fallback;
  }
  return `${base}/getImg/${s}`;
}
