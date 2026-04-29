import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  Tag,
  Save
} from "lucide-react";
import { useProjects, type Project } from "@/data/projectsData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppShell } from "@/components/layout/AppShell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ============================================================================
// Team Member Display
// ============================================================================
function TeamSection({ team }: { team: Project["team"] }) {
  const totalMembers = team.reduce((sum, t) => sum + t.count, 0);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Team Composition
        </h3>
        <Badge variant="secondary">{totalMembers} members</Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {team.map((member, idx) => (
          <Card key={idx} className="p-4 border-0 bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{member.role}</p>
            <p className="text-2xl font-bold text-emerald-600">{member.count}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QMS Records Section
// ============================================================================
function QMSRecordsSection({ f19Record, f28Records, agents }: { 
  f19Record?: string; 
  f28Records?: string[];
  agents?: string[];
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-emerald-600" />
        QMS Records
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Product Description</p>
          {f19Record ? (
            <a 
              href={`https://drive.google.com/drive/search?q=${f19Record}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Tag className="w-4 h-4" />
              {f19Record}
            </a>
          ) : (
            <p className="text-gray-400 italic">No F/19 record linked</p>
          )}
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">Training Records</p>
          {f28Records && f28Records.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {f28Records.map((f28, idx) => (
                <Badge key={idx} variant="secondary">{f28}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No F/28 records linked</p>
          )}
        </Card>
      </div>

      {agents && agents.length > 0 && (
        <Card className="p-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-3">
            Assigned Agents ({agents.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {agents.map((agent, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {agent}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, delete: deleteProject } = useProjects();
  const [deleteDialog, setDeleteDialog] = useState(false);

  const project = getById(id || "");

  if (!project) {
    return (
      <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Projects", path: "/projects" }, { label: "Not Found" }]}>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </AppShell>
    );
  }

  const isActive = project.status === "active";
  const isCompleted = project.status === "completed";
  
  const statusConfig = {
    active: { 
      label: "Active", 
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle2 
    },
    completed: { 
      label: "Completed", 
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle2 
    },
    pending: { 
      label: "Pending", 
      color: "bg-amber-100 text-amber-800",
      icon: Clock 
    },
  };
  
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  const handleEdit = () => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    navigate("/projects");
  };

  return (
    <AppShell 
      breadcrumbs={[
        { label: "Dashboard", path: "/" }, 
        { label: "Projects", path: "/projects" }, 
        { label: project.name }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/projects")}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div
            >
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1", status.color)}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{project.code}</span>
                <span>{project.type}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit} className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialog(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Client</p>
                <p className="font-semibold">{project.client}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Team Size</p>
                <p className="font-semibold">{project.teamSize} members</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Duration</p>
                <p className="font-semibold">
                  {project.startDate 
                    ? new Date(project.startDate).toLocaleDateString() 
                    : "N/A"} - {project.endDate 
                      ? new Date(project.endDate).toLocaleDateString() 
                      : "Present"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          
          {project.descriptionAr && (
            <>
              <Separator className="my-4" />
              <p className="text-gray-700 whitespace-pre-wrap" dir="rtl">{project.descriptionAr}</p>
            </>
          )}
        </Card>

        {/* Team */}
        <Card className="p-6">
          <TeamSection team={project.team} />
        </Card>

        {/* QMS Records */}
        <Card className="p-6">
          <QMSRecordsSection 
            f19Record={project.f19Record}
            f28Records={project.f28Records}
            agents={project.agents}
          />
        </Card>

        {/* Metadata */}
        <Card className="p-6 bg-gray-50">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Created:</span> {project.createdAt || "N/A"} {
              " "}<span className="font-medium">| Last Updated:</span> {project.updatedAt || "N/A"}
          </p>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Project?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{project.name}</strong>? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
