// GitHub Pages serves this project from a sub-path (e.g. /cobbletoolkit),
// so any hand-written root-relative URL (raw <img>, <link>, fetch()) needs
// this prefix. next/image and next/link handle this automatically and do
// NOT need this helper.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBasePath(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path; // leave external URLs alone
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
