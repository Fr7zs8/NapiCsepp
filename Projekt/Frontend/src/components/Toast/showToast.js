export const DEFAULT_TOAST_DURATION = 3000;

export function showToast(message, type = "success", duration = DEFAULT_TOAST_DURATION) {
  window.dispatchEvent(new CustomEvent("showToast", { detail: { message, type, duration } }));
}
