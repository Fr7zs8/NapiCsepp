import React from 'react';

export default function AuthCard({ children, className = '' }){
  return (
    <div className={`auth-card ${className}`}>
      <div className="auth-card-inner">
        {children}
      </div>
    </div>
  );
}
