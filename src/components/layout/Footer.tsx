import { Calendar, Clock, Users, Settings } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString();

  return (
    <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-auto">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - System info */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
            </div>
          </div>

          {/* Center - QMS Info */}
          <div className="text-center">
            <div className="text-sm font-semibold text-foreground">
              QMS - Quality Management System
            </div>
            <div className="text-xs text-muted-foreground">
              ISO 9001:2015 Compliant
            </div>
          </div>

          {/* Right side - Copyright */}
          <div className="text-sm text-muted-foreground">
            © {currentYear} Quality Management System. All rights reserved.
          </div>
        </div>

        {/* Bottom border with accent color */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground/70">
            <div className="flex items-center gap-4">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Last Updated: {currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}