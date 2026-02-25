import React from "react";

export default function StatItem({ children, label, value, className = "" }) {
  return (
    <div className={`stat-item ${className}`}>
      <div className="data-icon-label">
        {children}
      </div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}
