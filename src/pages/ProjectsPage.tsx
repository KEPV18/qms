import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutGrid,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import { 
  useProjects, 
  type Project 
} from "@/data/projectsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { DecisionBanner } from "@/components/ui/DecisionBanner";
import { cn } from "@/lib/utils";

// ============================================================================
// Project Card Component
// ============================================================================
interface ProjectCardProps {
  project: Project;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const isActive = project.status === "active";
  const isCompleted = project.status === "completed";

  const statusConfig = {
    active: { 
      label: "Active", 
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle2 
    },
    completed: { 
      label: "Completed", 
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: CheckCircle2 
    },
    pending: { 
      label: "Pending", 
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Clock 
    },
  };

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  const compliancePercent = isCompleted ? 100 : isActive ? 85 : 0;

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "border border-gray-200 bg-white",
      isActive && "border-emerald-200",
      isCompleted && "border-blue-200"
    )}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isActive ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
          )}>
            <Briefcase className="w-5 h-5" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-500">{project.type}</p>

        {/* Status Badge */}
        <div className="mt-3">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border",
            status.color
          )}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{project.teamSize} team members</span>
          </div>
          {project.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(project.startDate).toLocaleDateString()} - 
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Present"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-medium">Client:</span>
            <span>{project.client}</span>
          </div>
        </div>

        {/* QMS Records */}
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">QMS Records</p>
          <div className="flex flex-wrap gap-1.5">
            {project.f19Record && (
              <Badge variant="secondary" className="text-xs bg-gray-100">
                {project.f19Record}
              </Badge>
            )}
            {project.f28Records?.map((f28, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-gray-100">
                {f28}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Button 
            onClick={onView}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
          >
            View Details
          </Button>
          <Button 
            onClick={onEdit}
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Stats Component
// ============================================================================
function StatsCards({ stats }: { stats: ReturnType<typeof useProjects>["stats"] }) {
  const cards = [
    { label: "Total Projects", value: stats.total, color: "bg-blue-50 text-blue-700" },
    { label: "Active", value: stats.active, color: "bg-emerald-50 text-emerald-700" },
    { label: "Completed", value: stats.completed, color: "bg-purple-50 text-purple-700" },
    { label: "Team Members", value: stats.totalTeam, color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={cn("p-4 border-0", card.color)}>
          <p className="text-2xl font-bold">{card.value}</p>
          <p className="text-xs font-medium opacity-80">{card.label}</p>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Delete Dialog
// ============================================================================
function DeleteDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  projectName: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">Delete Project?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================
export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, delete: deleteProject, stats, clients } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "pending">("all");
  const [clientFilter, setClientFilter] = useState<"all" | string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; project: Project | null }>({ 
    isOpen: false, 
    project: null 
  });

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesClient = clientFilter === "all" || project.client === clientFilter;
      
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [projects, searchQuery, statusFilter, clientFilter]);

  const handleView = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = (project: Project) => {
    setDeleteDialog({ isOpen: true, project });
  };

  const confirmDelete = () => {
    if (deleteDialog.project) {
      deleteProject(deleteDialog.project.id);
      setDeleteDialog({ isOpen: false, project: null });
    }
  };

  const handleAddNew = () => {
    navigate("/projects/new");
  };

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "Projects" }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            icon={Briefcase}
            iconClassName="text-emerald-600"
            title="Projects"
            description="Manage all 8 Vizzlo projects with QMS compliance"
          />
          <Button 
            onClick={handleAddNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </Button>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
                <Select value={statusFilter} onValueChange={(v: typeof statusFilter) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>{client}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => handleView(project.id)}
                onEdit={() => handleEdit(project.id)}
                onDelete={() => handleDelete(project)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </Card>
        )}

        {/* Footer */}
        <Card className="p-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>
              Showing <span className="font-bold">{filteredProjects.length}</span> of {" "}
              <span className="font-bold">{projects.length}</span> projects
            </p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending
              </span>
            </div>
          </div>
        </Card>

        {/* Delete Dialog */}
        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, project: null })}
          onConfirm={confirmDelete}
          projectName={deleteDialog.project?.name || ""}
        />
      </div>
    </AppShell>
  );
}
