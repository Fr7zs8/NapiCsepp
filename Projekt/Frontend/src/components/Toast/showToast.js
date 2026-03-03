export const DEFAULT_TOAST_DURATION = 3000;
export const ERROR_TOAST_DURATION = DEFAULT_TOAST_DURATION * 2;

export function showToast(message, type = "success", duration) {
  const resolvedDuration = duration ?? (type === "error" ? ERROR_TOAST_DURATION : DEFAULT_TOAST_DURATION);
  window.dispatchEvent(new CustomEvent("showToast", { detail: { message, type, duration: resolvedDuration } }));
}
