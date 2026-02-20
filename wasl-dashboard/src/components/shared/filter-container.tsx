
'use client';

import { cn } from "@/lib/utils";

interface FilterContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function FilterContainer({ children, className, ...props }: FilterContainerProps) {
    return (
        <div
            className={cn(
                "w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-3xl border shadow-sm space-y-4 transition-all hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
