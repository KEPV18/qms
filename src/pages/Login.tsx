import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, users, reloadUsers } = useAuth();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    await reloadUsers();
    const res = await login(email.trim(), password.trim());
    setIsLoading(false);
    if (!res.ok) {
      const backendNote = res.backend === "supabase" ? "System: Supabase" : "System: Local Storage";
      toast({ title: "Login Failed", description: `${res.message} — ${backendNote}`, variant: "destructive" });
      return;
    }
    try {
      if (localStorage.getItem(`approval_just_granted:${email}`) === "true") {
        toast({ title: "Admin Approved Your Account", description: "You can now log in normally" });
        localStorage.removeItem(`approval_just_granted:${email}`);
      }
    } catch { void 0; }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <div className="text-2xl font-bold text-indigo-900">QMS Platform</div>
        <div className="text-sm text-indigo-700">Quality Management System</div>
      </div>
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access your quality management dashboard</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Forgot password?</a>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium" 
            onClick={handleLogin} 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate("/register")}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up here
            </button>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 right-6 text-xs text-gray-500">
        © 2026 QMS Platform. All rights reserved.
      </div>
    </div>
  );
}