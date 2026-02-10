import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addUser, users, reloadUsers } = useAuth();
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsLoading(true);
    if (!name || !email || !password || password !== confirm) {
      setIsLoading(false);
      toast({ title: "Incomplete Data", description: "Please fill all fields and ensure passwords match", variant: "destructive" });
      return;
    }
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setIsLoading(false);
      toast({ title: "Account Exists", description: "This email is already registered", variant: "destructive" });
      return;
    }
    if (!supabase) {
      setIsLoading(false);
      toast({ title: "Registration Failed", description: "Supabase connection not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY", variant: "destructive" });
      return;
    }
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signErr || !signData?.user?.id) {
      setIsLoading(false);
      const msg = signErr?.message || "Error creating Supabase user";
      toast({ title: "Registration Failed", description: msg, variant: "destructive" });
      return;
    }
    const id = crypto.randomUUID();
    const userId = signData.user.id;
    const { error: insertErr } = await supabase.from("profiles").upsert(
      {
        id,
        user_id: userId,
        email,
        is_active: false,
        last_login: new Date(0).toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (insertErr) {
      setIsLoading(false);
      const info = [
        insertErr.message ? `Message: ${insertErr.message}` : "",
        insertErr.code ? `Code: ${insertErr.code}` : "",
        insertErr.details ? `Details: ${insertErr.details}` : "",
        insertErr.hint ? `Hint: ${insertErr.hint}` : "",
      ].filter(Boolean).join(" — ");
      const desc = info || "Database configuration required. Check RLS policies and permissions";
      toast({ title: "Registration Failed", description: desc, variant: "destructive" });
      return;
    }
    try {
      const { data: rolesExist } = await supabase.from("user_roles").select("id").eq("user_id", userId).limit(1);
      if (Array.isArray(rolesExist) && rolesExist.length > 0) {
        await supabase.from("user_roles").update({ role: "user" }).eq("user_id", userId);
      } else {
        await supabase.from("user_roles").insert({
          id: crypto.randomUUID(),
          user_id: userId,
          role: "user",
        });
      }
    } catch { void 0; }
    await reloadUsers();
    const { data } = await supabase.from("profiles").select("id").eq("user_id", userId).limit(1);
    const confirmed = Array.isArray(data) && data.length > 0;
    setIsLoading(false);
    if (!confirmed) {
      toast({ title: "Registration Failed", description: "Database required. Please try again", variant: "destructive" });
      return;
    }
    toast({ title: "Account Created", description: "You can now log in" });
    navigate("/login");
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">Join Quality Management System</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your full name"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
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
              placeholder="Create a password"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-gray-700">Confirm Password</Label>
            <Input 
              id="confirm" 
              type="password" 
              value={confirm} 
              onChange={(e) => setConfirm(e.target.value)} 
              placeholder="Confirm your password"
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium" 
            onClick={handleRegister} 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign in here
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