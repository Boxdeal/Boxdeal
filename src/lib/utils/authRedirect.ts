// Where to send the user once login finishes. Stored in localStorage so the
// destination survives every login path — password, phone OTP (→ complete
// profile), and Google OAuth (which round-trips through an external page and
// /auth/callback). Each entry point records it; the final step consumes it.

const KEY = "postLoginRedirect";
const DEFAULT = "/account";

// Paths we should never "return" to after login.
function isSafe(path: string | null | undefined): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login") && !path.startsWith("/auth");
}

export function setPostLoginRedirect(path: string | null | undefined) {
  try {
    if (isSafe(path)) localStorage.setItem(KEY, path);
  } catch {
    /* ignore (SSR / storage disabled) */
  }
}

// Reads and clears the stored destination.
export function takePostLoginRedirect(fallback = DEFAULT): string {
  try {
    const value = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return isSafe(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
