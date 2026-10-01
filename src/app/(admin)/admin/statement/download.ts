import { toast } from "sonner";

/**
 * Fetch a file from an admin endpoint and save it.
 *
 * Goes through fetch rather than a plain link because the endpoint answers
 * with either a file or a JSON error — a refusal on a link would navigate the
 * admin to raw JSON instead of showing them what went wrong.
 */
export async function downloadFromApi(url: string, fallbackName: string): Promise<void> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: null }));
      toast.error(error ?? "Could not build the file. Please try again.");
      return;
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] ?? fallbackName;

    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  } catch {
    toast.error("Could not build the file. Please check your connection.");
  }
}
