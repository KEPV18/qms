import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Shield,
  Server,
  User,
  Loader2,
  RefreshCw,
  LogOut,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import { checkDriveWritePermission } from "@/lib/driveService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({
  open,
  onOpenChange,
}: SettingsModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, changePassword } = useAuth();

  const [driveStatus, setDriveStatus] = useState<
    "idle" | "checking" | "success" | "error"
  >("idle");
  const [driveMessage, setDriveMessage] = useState("");
  const [serverStatus, setServerStatus] = useState<
    "idle" | "checking" | "online" | "offline"
  >("idle");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const needsGoogleAuth =
    driveStatus === "error" &&
    (driveMessage.toLowerCase().includes("no access token") ||
      driveMessage.toLowerCase().includes("no refresh token"));

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleCheckDrive = async () => {
    setDriveStatus("checking");
    setDriveMessage("");

    try {
      const result = await checkDriveWritePermission();

      if (result.success) {
        setDriveStatus("success");
        setDriveMessage(result.message);
        toast({
          title: "Drive Permission Verified",
          description: "Read/Write access confirmed.",
          className: "bg-success text-success-foreground",
        });
      } else {
        setDriveStatus("error");
        setDriveMessage(result.message);
        toast({
          title: "Drive Permission Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch {
      setDriveStatus("error");
      setDriveMessage("An unexpected error occurred.");
    }
  };

  const handleCheckServer = async () => {
    setServerStatus("checking");

    try {
      const response = await fetch("/api/auth?health=true");

      if (response.ok) {
        setServerStatus("online");
        toast({
          title: "Server Online",
          description: "Backend connection active.",
          className: "bg-success text-success-foreground",
        });
      } else {
        setServerStatus("offline");
        toast({
          title: "Server Connection Error",
          description: "Could not reach backend.",
          variant: "destructive",
        });
      }
    } catch {
      setServerStatus("offline");
      toast({
        title: "Server Connection Failed",
        description: "Network error.",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = () => {
    const isDev = import.meta.env.DEV;
    const apiBase = isDev ? "http://localhost:3001" : "";
    const authUrl = `${apiBase}/api/auth`;

    const popup = window.open(
      authUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!popup) {
      window.location.href = authUrl;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRefreshSession = async () => {
    await queryClient.invalidateQueries();
    toast({
      title: "Session Refreshed",
      description: "Data cache invalidated.",
    });
  };

  const handleChangePassword = () => {
    if (!user) return;

    const ok = changePassword(user.id, oldPass, newPass);

    if (!ok) {
      toast({
        title: "Password not changed",
        description: "Old password incorrect",
        variant: "destructive",
      });
      return;
    }

    setOldPass("");
    setNewPass("");

    toast({
      title: "Password updated",
      description: "Your password has been changed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SettingsIcon className="w-5 h-5" />
            Platform Settings & Diagnostics
          </DialogTitle>
          <DialogDescription>
            Manage your preferences and verify system health.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="diagnostics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="diagnostics">
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="account">
              Account
            </TabsTrigger>
            <TabsTrigger value="general">
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics" className="space-y-4 py-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Google Drive Permissions
                  </CardTitle>
                  {driveStatus === "success" && (
                    <Badge className="bg-success">
                      Verified
                    </Badge>
                  )}
                  {driveStatus === "error" && (
                    <Badge variant="destructive">
                      Failed
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Verifies that the QMS Platform can read
                  and write files to your Google Drive.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {driveStatus === "error" && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>
                      Permission Error
                    </AlertTitle>
                    <AlertDescription>
                      {driveMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {driveStatus === "success" && (
                  <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      {driveMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex gap-2 flex-col sm:flex-row">
                <Button
                  onClick={handleCheckDrive}
                  disabled={driveStatus === "checking"}
                >
                  {driveStatus === "checking" && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Run Permission Check
                </Button>

                {needsGoogleAuth && (
                  <Button
                    variant="secondary"
                    onClick={handleGoogleSignIn}
                  >
                    Sign in with Google
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
