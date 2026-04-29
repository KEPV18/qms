import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  X
} from "lucide-react";
import { useProjects, type Project } from "@/data/projectsData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AppShell } from "@/components/layout/AppShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ============================================================================
// Team Member Form
// ============================================================================
interface TeamMember {
  role: string;
  count: number;
}

function TeamMemberForm({ 
  members, 
  onChange 
}: { 
  members: TeamMember[]; 
  onChange: (members: TeamMember[]) => void;
}) {
  const addMember = () => {
    onChange([...members, { role: "", count: 1 }]);
  };

  const updateMember = (idx: number, field: keyof TeamMember, value: string | number) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const removeMember = (idx: number) => {
    onChange(members.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      {members.map((member, idx) => (
        <div key={idx} className="flex gap-3 items-start">
          <Input
            placeholder="Role (e.g., Annotation Agents)"
            value={member.role}
            onChange={(e) => updateMember(idx, "role", e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            min="1"
            placeholder="Count"
            value={member.count}
            onChange={(e) => updateMember(idx, "count", parseInt(e.target.value) || 1)}
            className="w-24"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeMember(idx)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={addMember} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Team Member
      </Button>
    </div>
  );
}

// ============================================================================
// Main Form Component
// ============================================================================
export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, create, update } = useProjects();
  const isEditing = id && id !== "new";

  const existingProject = isEditing ? getById(id) : null;

  const [formData, setFormData] = useState<Partial<Project>>>({
    name: "",
    nameAr: "",
    type: "",
    typeAr: "",
    client: "",
    status: "active",
    startDate: "",
    endDate: "",
    team: [{ role: "", count: 1 }],
    description: "",
    descriptionAr: "",
    f19Record: "",
    f28Records: [],
    agents: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data
  useEffect(() => {
    if (existingProject) {
      setFormData({
        ...existingProject,
        team: existingProject.team.length > 0 ? existingProject.team : [{ role: "", count: 1 }],
      });
    }
  }, [existingProject]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = "Project name is required";
    if (!formData.type?.trim()) newErrors.type = "Project type is required";
    if (!formData.client?.trim()) newErrors.client = "Client is required";
    if (!formData.description?.trim()) newErrors.description = "Description is required";
    
    if (formData.team?.every(m => !m.role.trim())) {
      newErrors.team = "At least one team member is required";
    }

    // Dates validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // Calculate team size
      const teamSize = (formData.team || []).reduce((sum, m) => sum + (m.count || 0), 0);
      
      const data = {
        ...formData,
        teamSize,
      } as Omit<Project, "id" | "code" | "createdAt" | "updatedAt">;

      // Filter empty team members
      data.team = (formData.team || []).filter(m => m.role.trim() !== "");

      // Process agents
      if (formData.agents) {
        data.agents = typeof formData.agents === "string" 
          ? (formData.agents as string).split(",").map(a => a.trim()).filter(Boolean)
          : formData.agents;
      }

      // Process F28 records
      if (formData.f28Records) {
        data.f28Records = typeof formData.f28Records === "string"
          ? (formData.f28Records as string).split(",").map(r => r.trim()).filter(Boolean)
          : formData.f28Records;
      }

      if (isEditing && id) {
        update(id, data);
        navigate(`/projects/${id}`);
      } else {
        const newProject = create(data);
        navigate(`/projects/${newProject.id}`);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof Project>(field: K, value: Project[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <AppShell 
      breadcrumbs={[
        { label: "Dashboard", path: "/" }, 
        { label: "Projects", path: "/projects" }, 
        { label: isEditing ? "Edit Project" : "New Project" }
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => navigate(isEditing ? `/projects/${id}` : "/projects")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Edit Project" : "Create New Project"}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(isEditing ? `/projects/${id}` : "/projects")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Save className="w-4 h-4" />
                {isEditing ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  Project Information
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g., Video Detection Project"
                      className={cn(errors.name && "border-red-500")}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameAr">Project Name (Arabic)</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr || ""}
                      onChange={(e) => updateField("nameAr", e.target.value)}
                      placeholder="اسم المشروع بالعربية"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Project Type *</Label>
                    <Input
                      id="type"
                      value={formData.type || ""}
                      onChange={(e) => updateField("type", e.target.value)}
                      placeholder="e.g., AI Model Testing"
                      className={cn(errors.type && "border-red-500")}
                    />
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeAr">Project Type (Arabic)</Label>
                    <Input
                      id="typeAr"
                      value={formData.typeAr || ""}
                      onChange={(e) => updateField("typeAr", e.target.value)}
                      placeholder="نوع المشروع بالعربية"
                      dir="rtl"
                    />
                  </div>
                </div>
              </Card>

              {/* Client & Status */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Client & Status</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Input
                      id="client"
                      value={formData.client || ""}
                      onChange={(e) => updateField("client", e.target.value)}
                      placeholder="e.g., ETH, BatFast, OMNIAZ"
                      className={cn(errors.client && "border-red-500")}
                    />
                    {errors.client && <p className="text-sm text-red-500">{errors.client}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v: "active" | "completed" | "pending") => updateField("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate || ""}
                        onChange={(e) => updateField("startDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate || ""}
                        onChange={(e) => updateField("endDate", e.target.value)}
                        className={cn(errors.endDate && "border-red-500")}
                      />
                      {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (English) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Describe the project scope and objectives..."
                      rows={4}
                      className={cn(errors.description && "border-red-500")}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr || ""}
                      onChange={(e) => updateField("descriptionAr", e.target.value)}
                      placeholder="وصف المشروع بالعربية..."
                      rows={4}
                      dir="rtl"
                    />
                  </div>
                </div>
              </Card>

              {/* Team */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Team Composition *</h2>
                <TeamMemberForm
                  members={formData.team || [{ role: "", count: 1 }]}
                  onChange={(team) => updateField("team", team as Project["team"])}
                />
                {errors.team && <p className="text-sm text-red-500 mt-2">{errors.team}</p>}
              </Card>

              {/* QMS Records */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">QMS Records Links</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="f19Record">F/19 Product Description</Label>
                    <Input
                      id="f19Record"
                      value={formData.f19Record || ""}
                      onChange={(e) => updateField("f19Record", e.target.value)}
                      placeholder="e.g., F/19-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="f28Records">F/28 Training Records (comma-separated)</Label>
                    <Input
                      id="f28Records"
                      value={typeof formData.f28Records === "string" 
                        ? formData.f28Records 
                        : formData.f28Records?.join(", ") || ""}
                      onChange={(e) => updateField("f28Records", e.target.value)}
                      placeholder="e.g., F/28-001, F/28-002"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agents">Assigned Agent IDs (comma-separated)</Label>
                    <Input
                      id="agents"
                      value={typeof formData.agents === "string"
                        ? formData.agents
                        : formData.agents?.join(", ") || ""}
                      onChange={(e) => updateField("agents", e.target.value)}
                      placeholder="e.g., VIZ-001, VIZ-002, VIZ-003"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
