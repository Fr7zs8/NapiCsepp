import { useState, useEffect, useCallback } from "react";
import "./Toast.css";

const DEFAULT_TOAST_DURATION = 3000; // ms

export function showToast(message, type = "success", duration = DEFAULT_TOAST_DURATION) {
  window.dispatchEvent(new CustomEvent("showToast", { detail: { message, type, duration } }));
}

export function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((e) => {
    const { message, type, duration } = e.detail;
    const id = Date.now() + Math.random();
    const toastDuration = typeof duration === 'number' ? duration : DEFAULT_TOAST_DURATION;
    setToasts((prev) => [...prev, { id, message, type, duration: toastDuration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toastDuration);
  }, []);

  useEffect(() => {
    window.addEventListener("showToast", addToast);
    return () => window.removeEventListener("showToast", addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="nc-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`nc-toast nc-toast-${toast.type}`}>
          <span className="nc-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          <span className="nc-toast-message">{toast.message}</span>
          {/* progress bar showing remaining time */}
          <div className="nc-toast-progress">
            <div className="nc-toast-progress-fill" style={{ animationDuration: `${toast.duration}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
