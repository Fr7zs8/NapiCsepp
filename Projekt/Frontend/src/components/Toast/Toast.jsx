import { useState, useEffect, useCallback } from "react";
import "./Toast.css";

export function showToast(message, type = "success") {
  window.dispatchEvent(new CustomEvent("showToast", { detail: { message, type } }));
}

export function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((e) => {
    const { message, type } = e.detail;
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
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
        </div>
      ))}
    </div>
  );
}
