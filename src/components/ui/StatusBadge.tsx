import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, getStatusBadgeClass } from "@/lib/statusService";
import type { RecordStatus } from "@/lib/googleSheets";
import { CheckCircle, Clock, FileEdit, XCircle } from "lucide-react";

interface StatusBadgeProps {
    status: RecordStatus;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const STATUS_ICONS = {
    draft: FileEdit,
    pending_review: Clock,
    approved: CheckCircle,
    rejected: XCircle,
};

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
    const label = STATUS_LABELS[status];
    const Icon = STATUS_ICONS[status];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <Badge
            variant="outline"
            className={`${getStatusBadgeClass(status)} ${sizeClasses[size]} font-medium inline-flex items-center gap-1.5`}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            <span>{label.en}</span>
        </Badge>
    );
}
