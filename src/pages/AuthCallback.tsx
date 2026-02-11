import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        toast({ title: "Error", description: "Authentication service not available", variant: "destructive" });
        navigate("/login");
        return;
      }

      try {
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session?.user) {
          toast({ title: "Authentication Failed", description: "Could not complete authentication", variant: "destructive" });
          navigate("/login");
          return;
        }

        // The auth state change listener in useAuth will handle profile creation
        // Just redirect to home - the listener will set up the user
        toast({ title: "Success", description: "Successfully signed in with Google" });
        navigate("/");
        
      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({ title: "Error", description: "An error occurred during authentication", variant: "destructive" });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <CardTitle className="text-2xl text-gray-900">Completing Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">Please wait while we complete your Google sign-in...</p>
        </CardContent>
      </Card>
    </div>
  );
}