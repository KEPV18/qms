import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming Select exists, if not I'll use native select or just Input for now to be safe, creating task to check Select later. Actually I saw select.tsx in list_dir.

export interface RiskItem {
    id: string;
    department: string;
    description: string;
    cause: string;
    likelihood: number;
    impact: number;
    score: number;
    action: string;
    owner: string;
    status: "Open" | "Controlled" | "Closed";
    reviewDate: string;
    linkedCapa: string;
}

const initialData: RiskItem[] = [
    { id: "R-01", department: "Operations", description: "High workload due to sudden increase in task volume from clients", cause: "Delay in delivery and pressure on teams", likelihood: 3, impact: 3, score: 9, action: "Daily workload monitoring, team redistribution, priority handling", owner: "Operations Manager", status: "Controlled", reviewDate: "31/01/2026", linkedCapa: "N/A" },
    { id: "R-02", department: "Operations / SLA", description: "Failure to meet SLA timelines", cause: "High volume and time-sensitive tasks", likelihood: 3, impact: 4, score: 12, action: "Real-time monitoring, escalation to team leaders, dedicated SLA teams", owner: "Operations Lead", status: "Controlled", reviewDate: "31/01/2026", linkedCapa: "N/A" },
    { id: "R-03", department: "Quality", description: "Inconsistent quality output across agents", cause: "Different experience levels and skill gaps", likelihood: 3, impact: 3, score: 9, action: "QA sampling, clear guidelines, refresher training", owner: "Quality Lead", status: "Open", reviewDate: "31/01/2026", linkedCapa: "May require CAPA if repeated" },
    { id: "R-04", department: "Training", description: "New agents assigned before full training completion", cause: "Urgent operational demand", likelihood: 2, impact: 3, score: 6, action: "Mandatory training validation before task assignment", owner: "Training Lead", status: "Controlled", reviewDate: "31/01/2026", linkedCapa: "N/A" },
    { id: "R-05", department: "Resources / HR", description: "Agent turnover impacting productivity", cause: "Attrition and workload pressure", likelihood: 3, impact: 3, score: 9, action: "Backup staffing, staggered onboarding, team leader support", owner: "HR / Operations", status: "Open", reviewDate: "31/01/2026", linkedCapa: "N/A" },
    { id: "R-06", department: "Data Security", description: "Mishandling of customer data", cause: "Human error or unauthorized access", likelihood: 2, impact: 5, score: 10, action: "NDA enforcement, access control, client-secured platforms", owner: "Management", status: "Controlled", reviewDate: "31/01/2026", linkedCapa: "N/A" },
];

export function RiskRegisterTab() {
    const [risks, setRisks] = useState<RiskItem[]>(initialData);
    const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Controlled": return "default";
            case "Open": return "destructive";
            case "Closed": return "secondary";
            default: return "outline";
        }
    };

    const handleEditClick = (risk: RiskItem) => {
        setEditingRisk({ ...risk });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!editingRisk) return;

        // Recalculate score
        const updatedRisk = {
            ...editingRisk,
            score: editingRisk.likelihood * editingRisk.impact
        };

        setRisks(prev => prev.map(r => r.id === updatedRisk.id ? updatedRisk : r));
        setIsEditOpen(false);
        setEditingRisk(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="font-semibold text-lg">Risk Register</h3>
                    <p className="text-sm text-muted-foreground">Identify, assess, and monitor potential risks.</p>
                </div>
                {/* Add functionality allows for future implementation, prioritizing Edit now */}
                {/* <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Risk
                </Button> */}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Dept</TableHead>
                            <TableHead className="max-w-[200px]">Description</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Action / Control</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Linked CAPA</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {risks.map((risk) => (
                            <TableRow key={risk.id}>
                                <TableCell className="font-medium">{risk.id}</TableCell>
                                <TableCell>{risk.department}</TableCell>
                                <TableCell className="max-w-[200px]">
                                    <div className="font-medium text-sm truncate" title={risk.description}>{risk.description}</div>
                                    <div className="text-xs text-muted-foreground truncate" title={risk.cause}>{risk.cause}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center">
                                        <Badge variant="outline" className="font-bold">{risk.score}</Badge>
                                        <span className="text-[10px] text-muted-foreground">({risk.likelihood} x {risk.impact})</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm truncate max-w-[150px]" title={risk.action}>{risk.action}</TableCell>
                                <TableCell className="text-sm">{risk.owner}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusColor(risk.status) as any}>{risk.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{risk.linkedCapa}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(risk)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Risk {editingRisk?.id}</DialogTitle>
                    </DialogHeader>
                    {editingRisk && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Risk ID</Label>
                                    <Input value={editingRisk.id} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input
                                        value={editingRisk.department}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, department: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingRisk.description}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Cause</Label>
                                <Textarea
                                    value={editingRisk.cause}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, cause: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Likelihood (1-5)</Label>
                                    <Input
                                        type="number"
                                        min="1" max="5"
                                        value={editingRisk.likelihood}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, likelihood: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Impact (1-5)</Label>
                                    <Input
                                        type="number"
                                        min="1" max="5"
                                        value={editingRisk.impact}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, impact: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Score (Calc)</Label>
                                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        {editingRisk.likelihood * editingRisk.impact}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Action / Control</Label>
                                <Textarea
                                    value={editingRisk.action}
                                    onChange={(e) => setEditingRisk({ ...editingRisk, action: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Owner</Label>
                                    <Input
                                        value={editingRisk.owner}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, owner: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={editingRisk.status}
                                        onValueChange={(val: any) => setEditingRisk({ ...editingRisk, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="Controlled">Controlled</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Review Date</Label>
                                    <Input
                                        value={editingRisk.reviewDate}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, reviewDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Linked CAPA</Label>
                                    <Input
                                        value={editingRisk.linkedCapa}
                                        onChange={(e) => setEditingRisk({ ...editingRisk, linkedCapa: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
