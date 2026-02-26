import { Navigate } from "react-router-dom";

function isTokenValid() {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            return false;
        }
        return true;
    } catch {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        return false;
    }
}

export function ProtectedRouter({ children }) {
    if (!isTokenValid()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}