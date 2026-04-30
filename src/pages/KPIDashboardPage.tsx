import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  Users, 
  TrendingUp, 
  Award, 
  Briefcase,
  BarChart3,
  PieChart,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { 
  KPI_DATA, 
  getAllCategories, 
  getAllRoleTitles,
  getKPIStatistics,
  getCategoryColor,
  calculateRoleKPIScore,
  type RoleKPIData,
  type KPI
} from "@/data/kpiData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Helper function to calculate total weight
const calculateTotalWeight = (kpis: KPI[]) => {
  return kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
};

// Role KPI Card Component
const RoleKPICard = ({ role, onClick }: { role: RoleKPIData; onClick: () => void }) => {
  const totalWeight = calculateTotalWeight(role.kpis);
  const isWeightValid = totalWeight >= 0.95 && totalWeight <= 1.05;
  const categories = [...new Set(role.kpis.map(k => k.category))];
  
  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer border-l-4"
      style={{ borderLeftColor: isWeightValid ? '#10b981' : '#ef4444' }}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800">
              {role.title}
            </CardTitle>
            <p className="text-sm text-slate-500">{role.department}</p>
          </div>
          <Badge variant={isWeightValid ? "default" : "destructive"}>
            {role.kpis.length} KPIs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Manager info */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>Reports to: {role.manager}</span>
          </div>
          
          {/* Weight validation */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Weight Total:</span>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
                {(totalWeight * 100).toFixed(0)}%
              </span>
              {isWeightValid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-1 pt-2">
            {categories.slice(0, 3).map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// KPI Detail View Component
const KPIDetailView = ({ role }: { role: RoleKPIData }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-2xl font-bold text-slate-800">{role.title}</h3>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
          <span><strong>Department:</strong> {role.department}</span>
          <span><strong>Manager:</strong> {role.manager}</span>
          <span><strong>Level:</strong> {role.jobLevel}</span>
          <span><strong>Status:</strong> {role.employmentStatus}</span>
        </div>
      </div>
      
      {/* KPIs Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Objective</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Weight</TableHead>
              <TableHead className="text-center">Target</TableHead>
              <TableHead className="text-center">Evaluation</TableHead>
              <TableHead className="text-center">Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {role.kpis.map((kpi, idx) => {
              const achievement = kpi.evaluation 
                ? (kpi.evaluation / kpi.target) * 100 
                : 0;
              
              return (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium align-top">
                    <span className="text-slate-700">{kpi.objective}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      style={{ 
                        backgroundColor: getCategoryColor(kpi.category),
                        color: 'white'
                      }}
                    >
                      {kpi.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {(kpi.weight * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {(kpi.target * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {kpi.evaluation !== null 
                      ? (kpi.evaluation * 100).toFixed(0) + '%' 
                      : '-'
                    }
                  </TableCell>
                  <TableCell className="text-center">
                    {kpi.evaluation !== null ? (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(achievement, 100)} 
                          className={`w-16 h-2 ${
                            achievement >= 100 ? 'bg-green-500' : 
                            achievement >= 80 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                        />
                        <span className={`text-xs font-medium ${
                          achievement >= 100 ? 'text-green-600' : 
                          achievement >= 80 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {achievement.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-700 mb-2">KPI Configuration Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500">KPI Weight:</span>
            <span className="ml-2 font-medium">{(role.kpiWeight * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-500">Competencies:</span>
            <span className="ml-2 font-medium">{(role.competenciesWeight * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-slate-500">Total KPIs:</span>
            <span className="ml-2 font-medium">{role.kpis.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Total Weight:</span>
            <span className={`ml-2 font-medium ${
              calculateTotalWeight(role.kpis) >= 0.95 && calculateTotalWeight(role.kpis) <= 1.05
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {(calculateTotalWeight(role.kpis) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
export default function KPIDashboardPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<RoleKPIData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const categories = getAllCategories();
  const statistics = getKPIStatistics();
  
  // Filter roles
  const filteredRoles = useMemo(() => {
    return KPI_DATA.filter(role => {
      const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          role.manager.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
                            role.kpis.some(k => k.category === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    KPI Dashboard
                  </h1>
                  <p className="text-sm text-slate-500">
                    Individual Performance Management (IPM) - ISO 9001:2015
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Total Roles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-800">{statistics.totalRoles}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-800">{statistics.totalKPIs}</p>
                <p className="text-xs text-slate-500">Avg {statistics.avgKPIsPerRole} per role</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-800">{statistics.categories}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Valid Weights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-800">
                  {statistics.rolesWithValidWeights}/{statistics.totalRoles}
                </p>
                <p className="text-xs text-slate-500">Roles with 100% weight</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search roles, departments, managers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </Button>
                  <Button 
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                  >
                    Table
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Results Count */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Showing {filteredRoles.length} of {KPI_DATA.length} roles
            </span>
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Category: {selectedCategory}
              </Badge>
            )}
          </div>
          
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map(role => (
                <Dialog key={role.roleKey}>
                  <DialogTrigger asChild>
                    <div>
                      <RoleKPICard role={role} onClick={() => setSelectedRole(role)} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>KPI Details</DialogTitle>
                    </DialogHeader>
                    <KPIDetailView role={role} />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
          
          {/* Table View */}
          {viewMode === "table" && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead className="text-center">KPIs</TableHead>
                      <TableHead className="text-center">Total Weight</TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map(role => {
                      const totalWeight = calculateTotalWeight(role.kpis);
                      const isValid = totalWeight >= 0.95 && totalWeight <= 1.05;
                      
                      return (
                        <TableRow key={role.roleKey}>
                          <TableCell className="font-medium">{role.title}</TableCell>
                          <TableCell>{role.department}</TableCell>
                          <TableCell>{role.manager}</TableCell>
                          <TableCell className="text-center">{role.kpis.length}</TableCell>
                          <TableCell className="text-center">
                            <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                              {(totalWeight * 100).toFixed(0)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set(role.kpis.map(k => k.category))].slice(0, 2).map(cat => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>KPI Details</DialogTitle>
                                </DialogHeader>
                                <KPIDetailView role={role} />
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          
          {/* Category Legend */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Category Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Badge 
                    key={cat}
                    style={{ 
                      backgroundColor: getCategoryColor(cat),
                      color: 'white'
                    }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Audit Note */}
          <Card className="mt-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">ISO 9001:2015 Compliance Note</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This KPI Dashboard provides Individual Performance Management (IPM) data for all operational roles. 
                    Per ISO 9001:2015 Clause 9.3.2, Management Review inputs include organizational performance data. 
                    Each role's KPI weights must sum to 100%. Valid weights are indicated with green borders.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    Source: /home/kepa/Downloads/FORMS/vezlooipmssheets/ | Generated: {new Date().toISOString().split('T')[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  );
}
