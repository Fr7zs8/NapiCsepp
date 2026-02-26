import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./PasswordInput.css";

export default function PasswordInput({ value, onChange, placeholder, required = false, className = "" }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={`password-input-wrap ${className}`}>
            <input
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />
            <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setVisible(v => !v)}
                tabIndex={-1}
                aria-label={visible ? "Jelszó elrejtése" : "Jelszó mutatása"}
            >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}
