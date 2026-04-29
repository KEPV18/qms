// ============================================================================
// Projects Data — All 8 Vizzlo Projects with CRUD Operations
// ============================================================================

import { useState, useCallback, useEffect } from "react";

export interface TeamMember {
  role: string;
  count: number;
}

export interface Project {
  id: string;
  code: string;
  projectCode: string;
  serialNumber: string;
  name: string;
  nameAr?: string;
  type: string;
  typeAr: string;
  client: string;
  status: "active" | "completed" | "pending";
  startDate?: string;
  endDate?: string;
  teamSize: number;
  team: TeamMember[];
  description: string;
  descriptionAr: string;
  f19Record?: string;
  f28Records?: string[];
  agents?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Initial Projects Data
const INITIAL_PROJECTS: Project[] = [
  {
    id: "VDP-001",
    code: "PROJ-001",
    projectCode: "VDP",
    serialNumber: "001",
    name: "Video Detection Project",
    nameAr: "مشروع كشف الفيديو",
    type: "Video Classification & Detection",
    typeAr: "تصنيف وكشف الفيديو",
    client: "External Client",
    status: "active",
    teamSize: 12,
    team: [
      { role: "Annotation Agents", count: 8 },
      { role: "Team Leaders", count: 2 },
      { role: "QA Specialists", count: 2 }
    ],
    description: "AI-powered video classification and object detection annotation for machine learning model training.",
    descriptionAr: "تعليقات تصنيف الفيديو والكشف عن الأجسام المدعومة بالذكاء الاصطناعي لتدريب نماذج التعلم الآلي.",
    f19Record: "F/19-004",
    f28Records: ["F/28-001"],
    createdAt: "2026-01-15",
    updatedAt: "2026-04-20"
  },
  {
    id: "VAI-002",
    code: "PROJ-002",
    projectCode: "VAI",
    serialNumber: "002",
    name: "Vocal AI Project",
    nameAr: "مشروع الذكاء الاصطناعي الصوتي",
    type: "Conversational AI Design & Testing",
    typeAr: "تصميم واختبار الذكاء الاصطناعي التفاعلي",
    client: "Internal R&D",
    status: "active",
    teamSize: 8,
    team: [
      { role: "Senior AI Designers", count: 4 },
      { role: "Junior AI Designers", count: 2 },
      { role: "QC Specialists", count: 1 },
      { role: "Team Leader", count: 1 }
    ],
    description: "Design and testing of conversational AI systems with natural language processing capabilities.",
    descriptionAr: "تصميم واختبار أنظمة الذكاء الاصطناعي التفاعلي مع قدرات معالجة اللغة الطبيعية.",
    f19Record: "F/19-005",
    f28Records: ["F/28-002"],
    createdAt: "2026-01-20",
    updatedAt: "2026-04-20"
  },
  {
    id: "TSA-003",
    code: "PROJ-003",
    projectCode: "TSA",
    serialNumber: "003",
    name: "Tennis / Sports Analytics",
    nameAr: "تحليلات التنس / الرياضة",
    type: "Sports Data Analysis & Tagging",
    typeAr: "تحليل بيانات الرياضة ووسمها",
    client: "Sports Analytics Company",
    status: "active",
    teamSize: 6,
    team: [
      { role: "Sports Analysts", count: 4 },
      { role: "QA Specialists", count: 2 }
    ],
    description: "Sports event data annotation and player movement tracking for tennis match analysis.",
    descriptionAr: "تعليقات بيانات الأحداث الرياضية وتتبع حركات اللاعبين لتحليل مباريات التنس.",
    f19Record: "F/19-006",
    f28Records: ["F/28-003"],
    createdAt: "2026-02-01",
    updatedAt: "2026-04-15"
  },
  {
    id: "OMN-004",
    code: "PROJ-004",
    projectCode: "OMN",
    serialNumber: "004",
    name: "OMNIAZ",
    nameAr: "أومنياz",
    type: "Data Annotation + Store Miner & Mapping",
    typeAr: "تعليق البيانات + تعدين وتعيين المتاجر",
    client: "OMNIAZ Platform",
    status: "active",
    teamSize: 12,
    team: [
      { role: "Annotation Agents", count: 10 },
      { role: "Reviewers", count: 2 }
    ],
    description: "Comprehensive data annotation and store location mapping for retail intelligence platform.",
    descriptionAr: "تعليق شامل للبيانات وتعيين مواقع المتاجر لمنصة ذكاء التجزئة.",
    f19Record: "F/19-007",
    f28Records: ["F/28-004"],
    createdAt: "2026-02-10",
    updatedAt: "2026-04-18"
  },
  {
    id: "ETH-005",
    code: "PROJ-005",
    projectCode: "ETH",
    serialNumber: "005",
    name: "ETH – AI Model Testing",
    nameAr: "ETH - اختبار نماذج الذكاء الاصطناعي",
    type: "AI Output Evaluation & Validation",
    typeAr: "تقييم والتحقق من مخرجات الذكاء الاصطناعي",
    client: "ETH / Adam",
    status: "completed",
    startDate: "2026-02-28",
    endDate: "2026-03-05",
    teamSize: 29,
    team: [
      { role: "Annotation Agents", count: 25 },
      { role: "Auditors", count: 4 }
    ],
    description: "AI model output evaluation and validation with comprehensive feedback loops.",
    descriptionAr: "تقييم مخرجات نماذج الذكاء الاصطناعي والتحقق منها مع حلقات feedback شاملة.",
    f19Record: "F/19-002",
    f28Records: ["F/28-010"],
    agents: ["VIZ-001", "VIZ-002", "VIZ-003", "VIZ-004", "VIZ-005", "VIZ-006", "VIZ-007", 
             "VIZ-008", "VIZ-009", "VIZ-010", "VIZ-011", "VIZ-012", "VIZ-013", "VIZ-014", "VIZ-015", "VIZ-016"],
    createdAt: "2026-02-01",
    updatedAt: "2026-03-05"
  },
  {
    id: "BTF-006",
    code: "PROJ-006",
    projectCode: "BTF",
    serialNumber: "006",
    name: "BatFast",
    nameAr: "باتفاست",
    type: "Image/Video Annotation",
    typeAr: "تعليق الصور والفيديو",
    client: "BatFast",
    status: "completed",
    startDate: "2026-02-01",
    endDate: "2026-02-17",
    teamSize: 7,
    team: [
      { role: "Annotation Team", count: 5 },
      { role: "QA Specialists", count: 2 }
    ],
    description: "Image and video annotation for sports analytics and player tracking applications.",
    descriptionAr: "تعليق الصور والفيديو لتطبيقات تحليلات الرياضة وتتبع اللاعبين.",
    f19Record: "F/19-001",
    f28Records: ["F/28-009"],
    agents: ["VIZ-001", "VIZ-002", "VIZ-003", "VIZ-004", "VIZ-005"],
    createdAt: "2026-01-25",
    updatedAt: "2026-02-17"
  },
  {
    id: "ETH2-007",
    code: "PROJ-007",
    projectCode: "ETH2",
    serialNumber: "007",
    name: "ETH — AI Model Testing (Copy 2)",
    nameAr: "ETH - اختبار نماذج الذكاء الاصطناعي (نسخة 2)",
    type: "AI Model Output Validation",
    typeAr: "التحقق من مخرجات نماذج الذكاء الاصطناعي",
    client: "ETH / Adam",
    status: "completed",
    startDate: "2026-02-28",
    endDate: "2026-03-05",
    teamSize: 15,
    team: [
      { role: "Annotation Agents", count: 12 },
      { role: "Team Leaders", count: 2 },
      { role: "QA Specialists", count: 1 }
    ],
    description: "Secondary batch of AI model validation with extended testing protocols.",
    descriptionAr: "دفعة ثانوية من التحقق من نماذج الذكاء الاصطناعي مع بروتوكولات اختبار موسعة.",
    f19Record: "F/19-003",
    f28Records: ["F/28-011", "F/28-012"],
    createdAt: "2026-02-15",
    updatedAt: "2026-03-05"
  },
  {
    id: "ETC-008",
    code: "PROJ-008",
    projectCode: "ETC",
    serialNumber: "008",
    name: "ETH-Cedric",
    nameAr: "ETH-سيدريك",
    type: "Video Annotation & Quality Review",
    typeAr: "تعليق الفيديو ومراجعة الجودة",
    client: "Cedric",
    status: "completed",
    startDate: "2026-02-25",
    endDate: "2026-03-05",
    teamSize: 8,
    team: [
      { role: "Annotation Agents", count: 6 },
      { role: "Team Leaders", count: 1 },
      { role: "QA Specialists", count: 1 }
    ],
    description: "Video annotation and quality review for AI training datasets with rigorous validation.",
    descriptionAr: "تعليق الفيديو ومراجعة الجودة لمجموعات بيانات تدريب الذكاء الاصطناعي مع تحقق صارم.",
    f19Record: "F/19-008",
    f28Records: ["F/28-011", "F/28-012"],
    agents: ["VIZ-001", "VIZ-003", "VIZ-013", "VIZ-017", "VIZ-018", "VIZ-019"],
    createdAt: "2026-02-20",
    updatedAt: "2026-03-05"
  }
];

// Storage Key
const STORAGE_KEY = "vizzlo_projects_data";

// ============================================================================
// CRUD Operations
// ============================================================================

let projectsCache: Project[] | null = null;

// Get all projects
export const getAllProjects = (): Project[] => {
  if (projectsCache) return projectsCache;
  
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        projectsCache = JSON.parse(stored);
        return projectsCache || INITIAL_PROJECTS;
      } catch {
        console.error("Failed to parse projects from localStorage");
      }
    }
  }
  return INITIAL_PROJECTS;
};

// Save projects to storage
const saveProjects = (projects: Project[]): void => {
  projectsCache = projects;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }
};

// Get project by ID
export const getProjectById = (id: string): Project | null => {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
};

// Get project by F/19 record
export const getProjectByF19 = (f19Code: string): Project | null => {
  const projects = getAllProjects();
  return projects.find(p => p.f19Record === f19Code) || null;
};

// Get projects by status
export const getActiveProjects = (): Project[] => {
  return getAllProjects().filter(p => p.status === "active");
};

export const getCompletedProjects = (): Project[] => {
  return getAllProjects().filter(p => p.status === "completed");
};

export const getPendingProjects = (): Project[] => {
  return getAllProjects().filter(p => p.status === "pending");
};

// Generate next project code
export const getNextProjectCode = (): string => {
  const projects = getAllProjects();
  const numbers = projects
    .map(p => {
      const match = p.code.match(/PROJ-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `PROJ-${String(max + 1).padStart(3, "0")}`;
};

// Create new project
export const createProject = (projectData: Omit<Project, "id" | "code" | "projectCode" | "serialNumber" | "createdAt" | "updatedAt">): Project => {
  const projects = getAllProjects();
  const nextSerial = projects.length + 1;
  const serialStr = String(nextSerial).padStart(3, "0");
  const newProject: Project = {
    ...projectData,
    id: `PRJ-${serialStr}`,
    code: `PROJ-${serialStr}`,
    projectCode: `PRJ`,
    serialNumber: serialStr,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0]
  };
  saveProjects([...projects, newProject]);
  return newProject;
};

// Update project
export const updateProject = (id: string, updates: Partial<Project>): Project | null => {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const updatedProject = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString().split("T")[0]
  };
  
  projects[index] = updatedProject;
  saveProjects(projects);
  return updatedProject;
};

// Delete project
export const deleteProject = (id: string): boolean => {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  if (filtered.length === projects.length) return false;
  saveProjects(filtered);
  return true;
};

// Get unique clients
export const getUniqueClients = (): string[] => {
  const projects = getAllProjects();
  return Array.from(new Set(projects.map(p => p.client))).sort();
};

// Get project statistics
export const getProjectStats = () => {
  const projects = getAllProjects();
  const totalAgents = projects.reduce((sum, p) => sum + p.teamSize, 0);
  const uniqueAgents = new Set<string>();
  projects.forEach(p => p.agents?.forEach(a => uniqueAgents.add(a)));
  
  return {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    pending: projects.filter(p => p.status === "pending").length,
    totalTeam: totalAgents,
    totalUniqueAgents: uniqueAgents.size
  };
};

// Reset to initial data (for testing)
export const resetProjects = (): void => {
  projectsCache = [...INITIAL_PROJECTS];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  }
};

// ============================================================================
// React Hook
// ============================================================================

export const useProjects = () => {
  const [projects, setProjectsState] = useState<Project[]>(getAllProjects);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh from storage
  const refresh = useCallback(() => {
    projectsCache = null;
    setProjectsState(getAllProjects());
  }, []);

  // Create
  const create = useCallback((data: Omit<Project, "id" | "code" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    const newProject = createProject(data);
    refresh();
    setIsLoading(false);
    return newProject;
  }, [refresh]);

  // Update
  const update = useCallback((id: string, updates: Partial<Project>) => {
    setIsLoading(true);
    const updated = updateProject(id, updates);
    refresh();
    setIsLoading(false);
    return updated;
  }, [refresh]);

  // Delete
  const remove = useCallback((id: string) => {
    setIsLoading(true);
    const result = deleteProject(id);
    refresh();
    setIsLoading(false);
    return result;
  }, [refresh]);

  // Get by ID
  const getById = useCallback((id: string) => {
    return projects.find(p => p.id === id) || null;
  }, [projects]);

  return {
    projects,
    isLoading,
    refresh,
    create,
    update,
    delete: remove,
    getById,
    stats: getProjectStats(),
    clients: getUniqueClients()
  };
};

// ============================================================================
// Export Initial Data for Reference
// ============================================================================
export const PROJECTS_DATA = getAllProjects();
