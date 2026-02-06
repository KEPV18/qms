import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAccess = () => {
    const envObj: Record<string, unknown> = (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
    const expected = typeof envObj.VITE_ADMIN_ACCESS_CODE === "string" ? envObj.VITE_ADMIN_ACCESS_CODE : "admin1500";
    if (code.trim() === String(expected).trim()) {
      localStorage.setItem("admin_gate_ok", "true");
      navigate("/admin/accounts");
    } else {
      setError("Invalid access code");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter admin access code to proceed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Access Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleAccess}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
