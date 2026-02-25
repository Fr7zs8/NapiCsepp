import React from "react";

export default function DataItem({ icon: Icon, label, value }) {
  return (
    <div className="data-item">
      <div className="data-icon-label">
        {Icon && <Icon size={20} />}
        <p className="data-label">{label}</p>
      </div>
      <p className="data-value">{value}</p>
    </div>
  );
}
