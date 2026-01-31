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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export interface CapaItem {
    id: string;
    type: string;
    description: string;
    reference: string; // NC / Audit / Complaint ID
    rootCause: string;
    correctiveAction: string;
    preventiveAction: string;
    responsible: string;
    targetDate: string;
    status: "Open" | "In Progress" | "Closed" | "Verified";
    effectivenessCheck: string;
    effectivenessDate: string;
    closureApproval: string;
    relatedRisk: string;
}

const initialData: CapaItem[] = []; // No initial data provided in prompt

export function CapaRegisterTab() {
    const [capas, setCapas] = useState<CapaItem[]>(initialData);
    const [editingCapa, setEditingCapa] = useState<CapaItem | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEditClick = (capa: CapaItem) => {
        setEditingCapa({ ...capa });
        setIsEditOpen(true);
    };

    const handleSave = () => {
        if (!editingCapa) return;
        setCapas(prev => prev.map(c => c.id === editingCapa.id ? editingCapa : c));
        setIsEditOpen(false);
        setEditingCapa(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="font-semibold text-lg">CAPA Register</h3>
                    <p className="text-sm text-muted-foreground">Track Corrective and Preventive Actions.</p>
                </div>
                {/* <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add CAPA
                </Button> */}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Reference</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="max-w-[250px]">Description & Root Cause</TableHead>
                            <TableHead className="max-w-[200px]">Actions (Corrective/Preventive)</TableHead>
                            <TableHead>Responsible</TableHead>
                            <TableHead>Target Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Effectiveness</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {capas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No CAPA records found. Click "Add CAPA" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            capas.map((capa) => (
                                <TableRow key={capa.id}>
                                    <TableCell className="font-medium">{capa.reference}</TableCell>
                                    <TableCell>{capa.type}</TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{capa.description}</div>
                                        <div className="text-xs text-muted-foreground mt-1">RC: {capa.rootCause}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs"><span className="font-semibold">CA:</span> {capa.correctiveAction}</div>
                                        <div className="text-xs mt-1"><span className="font-semibold">PA:</span> {capa.preventiveAction}</div>
                                    </TableCell>
                                    <TableCell className="text-sm">{capa.responsible}</TableCell>
                                    <TableCell className="text-sm">{capa.targetDate}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{capa.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{capa.effectivenessCheck}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(capa)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit CAPA {editingCapa?.id}</DialogTitle>
                    </DialogHeader>
                    {editingCapa && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>ID</Label>
                                    <Input value={editingCapa.id} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference (NC/Audit/Complaint)</Label>
                                    <Input
                                        value={editingCapa.reference}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, reference: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Input
                                        value={editingCapa.type}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, type: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description of Issue</Label>
                                <Textarea
                                    value={editingCapa.description}
                                    onChange={(e) => setEditingCapa({ ...editingCapa, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Root Cause Analysis</Label>
                                <Textarea
                                    value={editingCapa.rootCause}
                                    onChange={(e) => setEditingCapa({ ...editingCapa, rootCause: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Corrective Action</Label>
                                    <Textarea
                                        value={editingCapa.correctiveAction}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, correctiveAction: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Preventive Action</Label>
                                    <Textarea
                                        value={editingCapa.preventiveAction}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, preventiveAction: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Responsible Person</Label>
                                    <Input
                                        value={editingCapa.responsible}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, responsible: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Date</Label>
                                    <Input
                                        value={editingCapa.targetDate}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, targetDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={editingCapa.status}
                                        onValueChange={(val: any) => setEditingCapa({ ...editingCapa, status: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Verified">Verified</SelectItem>
                                            <SelectItem value="Closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Effectiveness Check</Label>
                                    <Input
                                        value={editingCapa.effectivenessCheck}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, effectivenessCheck: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Effectiveness Date</Label>
                                    <Input
                                        value={editingCapa.effectivenessDate}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, effectivenessDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Closure Approval</Label>
                                    <Input
                                        value={editingCapa.closureApproval}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, closureApproval: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Related Risk ID</Label>
                                    <Input
                                        value={editingCapa.relatedRisk}
                                        onChange={(e) => setEditingCapa({ ...editingCapa, relatedRisk: e.target.value })}
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
