import { useNavigate } from "react-router-dom";
import { Plus, ClipboardCheck, AlertTriangle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="default"
          className="justify-start gap-2 h-auto py-3"
          onClick={() => navigate("/risk-management")}
        >
          <Plus className="w-4 h-4" />
          <span>New Risk / Process</span>
        </Button>

        <Button
          variant="outline"
          className="justify-start gap-2 h-auto py-3"
          onClick={() => navigate("/audit")}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Start Audit</span>
        </Button>

        <Button
          variant="outline"
          className="justify-start gap-2 h-auto py-3"
          onClick={() => navigate("/audit")} // NCs are often part of Audits, or could be Risk
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Log NC</span>
        </Button>

        <Button
          variant="outline"
          className="justify-start gap-2 h-auto py-3"
          onClick={() => navigate("/archive")} // Best place for file management currently
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      </div>
    </div>
  );
}
