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
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Team Composition
        </h3>
        <Badge variant="secondary">{totalMembers} members</Badge>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {team.map((member, idx) => (
          <Card key={idx} className="p-4 border bg-card">
            <p className="text-sm font-medium text-foreground">{member.role}</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{member.count}</p>
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
      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        QMS Records
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Product Description</p>
          {f19Record ? (
            <a 
              href={`https://drive.google.com/drive/search?q=${f19Record}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              <Tag className="w-4 h-4" />
              {f19Record}
            </a>
          ) : (
            <p className="text-muted-foreground/60 italic text-sm">No F-19 record linked</p>
          )}
        </Card>
        
        <Card className="p-4 border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-3">F-28 Records</p>
          {f28Records && f28Records.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {f28Records.map((record, idx) => (
                <a 
                  key={idx}
                  href={`https://drive.google.com/drive/search?q=${record}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {record}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground/60 italic text-sm">No F-28 records linked</p>
          )}
        </Card>
      </div>

      {agents && agents.length > 0 && (
        <Card className="p-4 border bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Project Agents</p>
          <div className="flex flex-wrap gap-2">
            {agents.map((agent, idx) => (
              <Badge key={idx} variant="outline">{agent}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Edit Form (Inline)
// ============================================================================
interface EditFormProps {
  project: Project;
  onSave: (updated: Project) => void;
  onCancel: () => void;
}

function EditForm({ project, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState({ ...project });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Project Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <input
            type="text"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Client</label>
          <input
            type="text"
            name="client"
            value={form.client}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as Project["status"] }))}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <Separator />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <textarea
          name="description"
          value={form.description || ""}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border bg-background text-foreground border-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// Main Detail Page
// ============================================================================
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, update, delete: deleteProject } = useProjects();
  
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const project = getById(id || "");

  if (!project) {
    return (
      <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Projects", path: "/projects" }, { label: "Not Found" }]}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate("/projects")} className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white">
            Back to Projects
          </Button>
        </div>
      </AppShell>
    );
  }

  const isActive = project.status === "active";
  const isCompleted = project.status === "completed";

  const statusBadge = {
    active: { label: "Active", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    completed: { label: "Completed", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    pending: { label: "Pending", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  };

  const status = statusBadge[project.status];

  const handleSave = (updated: Project) => {
    update(updated.id, updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    navigate("/projects");
  };

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Projects", path: "/projects" }, { label: project.name }]}>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        {/* Header Card */}
        <Card className="p-6 border bg-card">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                isActive ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
              )}>
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                  <Badge variant="secondary" className="font-mono text-xs tracking-wider">
                    {project.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", status.color)}>
                    {project.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : project.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {status.label}
                  </span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{project.type}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white gap-2" : "gap-2"}
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "View Mode" : "Edit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog(true)}
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Info Row */}
          <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Team Size</p>
              <p className="text-lg font-bold text-foreground mt-1">{project.teamSize}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Client</p>
              <p className="text-lg font-bold text-foreground mt-1">{project.client}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Start</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">End</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Present"}
              </p>
            </div>
          </div>
        </Card>

        {/* Content: Edit or Details */}
        {isEditing ? (
          <Card className="p-6 border bg-card">
            <h2 className="text-lg font-semibold text-foreground mb-6">Edit Project</h2>
            <EditForm project={project} onSave={handleSave} onCancel={() => setIsEditing(false)} />
          </Card>
        ) : (
          <>
            {/* Team Section */}
            <Card className="p-6 border bg-card">
              <TeamSection team={project.team} />
            </Card>

            {/* QMS Records */}
            <Card className="p-6 border bg-card">
              <QMSRecordsSection 
                f19Record={project.f19Record} 
                f28Records={project.f28Records}
                agents={project.agents}
              />
            </Card>
          </>
        )}

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Delete Project?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone. All references to this project will be removed.
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
