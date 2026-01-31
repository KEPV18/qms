import { QMSRecord } from "@/lib/googleSheets";
import { AlertCircle, CalendarClock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingActionsProps {
    records: QMSRecord[];
    isLoading?: boolean;
}

export function PendingActions({ records, isLoading = false }: PendingActionsProps) {
    // Filter for overdue records
    const overdueRecords = records.filter(r => r.isOverdue);

    if (isLoading) return null; // Let skeleton loaders in other components handle visual loading state

    if (overdueRecords.length === 0) return null; // Don't show if nothing overdue

    return (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Action Required: Overdue Records</h3>
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {overdueRecords.length}
                </span>
            </div>

            <div className="space-y-3">
                {overdueRecords.slice(0, 5).map(record => (
                    <div key={record.rowIndex} className="flex items-center justify-between bg-background p-3 rounded-md border border-border shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-destructive/10 rounded-full shrink-0">
                                <CalendarClock className="w-4 h-4 text-destructive" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-foreground">{record.recordName}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{record.code}</span>
                                    <span>•</span>
                                    <span>Due: {record.fillFrequency}</span>
                                </div>
                            </div>
                        </div>

                        <Button size="sm" variant="ghost" className="shrink-0 h-8 gap-1" asChild>
                            <a href={record.folderLink} target="_blank" rel="noopener noreferrer">
                                Open
                                <ArrowRight className="w-3 h-3" />
                            </a>
                        </Button>
                    </div>
                ))}

                {overdueRecords.length > 5 && (
                    <p className="text-center text-xs text-muted-foreground mt-2">
                        + {overdueRecords.length - 5} more overdue items
                    </p>
                )}
            </div>
        </div>
    );
}
