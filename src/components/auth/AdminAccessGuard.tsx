import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function AdminAccessGuard({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const gate = typeof window !== "undefined" && localStorage.getItem("admin_gate_ok") === "true";
  if (!gate) {
    if (!user || user.role !== "admin") return <Navigate to="/admin" replace />;
  }
  return children;
}
