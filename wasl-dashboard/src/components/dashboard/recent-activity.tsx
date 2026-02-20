import { ActivityItem } from "@/hooks/useDashboard";
import { CheckCircle2, Clock, MapPin, PlusCircle } from "lucide-react";

interface RecentActivityProps {
    activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    if (!activities || activities.length === 0) {
        return <div className="text-center text-muted-foreground py-8">لا يوجد نشاطات حديثة</div>;
    }

    return (
        <div className="space-y-8">
            {activities.map((item) => {
                let icon = <PlusCircle className="h-4 w-4 text-blue-500" />;
                let statusText = "جديد";
                let statusColor = "text-blue-600";

                if (item.type === "sold") {
                    icon = <CheckCircle2 className="h-4 w-4 text-green-500" />;
                    statusText = "تم البيع";
                    statusColor = "text-green-600";
                } else if (item.type === "reserved") {
                    icon = <Clock className="h-4 w-4 text-orange-500" />;
                    statusText = "محجوز";
                    statusColor = "text-orange-600";
                }

                return (
                    <div key={item.id} className="flex items-center">
                        <div className="ms-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{statusText} - {item.description}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                {item.projectName && (
                                    <>
                                        <span>{item.projectName}</span>
                                        <span>•</span>
                                    </>
                                )}
                                {new Date(item.timestamp).toLocaleDateString('ar-SA')}
                            </p>
                        </div>
                        <div className={`me-auto font-medium ${statusColor} text-sm`}>
                            {item.amount ? `${item.amount.toLocaleString()} ر.س` : ''}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
