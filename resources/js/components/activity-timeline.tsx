import { Link } from '@inertiajs/react';
import {
    Bot,
    FilePlus2,
    ShieldAlert,
    ShieldCheck,
    TriangleAlert,
    Truck,
    type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ActivityType = 'report_received' | 'verification' | 'handling' | 'invalid' | 'bot' | 'processing_issue';

export type ActivityEvent = {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    context: string;
    actor: string;
    change: string | null;
    verification_change: string | null;
    report_id: number | null;
    report_code: string | null;
    href: string | null;
    occurred_at: string;
    time: string;
};

const activityStyles: Record<ActivityType, {
    label: string;
    icon: LucideIcon;
    style: string;
}> = {
    report_received: {
        label: 'Laporan baru',
        icon: FilePlus2,
        style: 'bg-primary/10 text-primary',
    },
    verification: {
        label: 'Verifikasi',
        icon: ShieldCheck,
        style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    handling: {
        label: 'Penanganan',
        icon: Truck,
        style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    invalid: {
        label: 'Tidak valid',
        icon: ShieldAlert,
        style: 'bg-destructive/10 text-destructive',
    },
    bot: {
        label: 'Bot Telegram',
        icon: Bot,
        style: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    processing_issue: {
        label: 'Perlu ditindaklanjuti',
        icon: TriangleAlert,
        style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
};

interface ActivityTimelineProps {
    activities: ActivityEvent[];
    compact?: boolean;
}

export function ActivityTimeline({ activities, compact = false }: ActivityTimelineProps) {
    if (activities.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <FilePlus2 className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-medium text-foreground">Belum ada aktivitas</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Laporan baru dan perubahan penanganan akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <ol className="divide-y divide-border/70" aria-label="Daftar aktivitas terbaru">
            {activities.map((activity) => {
                const metadata = activityStyles[activity.type];
                const Icon = metadata.icon;
                const content = (
                    <div className={cn(
                        'flex gap-3 rounded-xl transition-colors',
                        compact ? 'px-2 py-3' : 'p-4',
                        activity.href && 'hover:bg-muted/50',
                    )}>
                        <span className={cn('mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl', metadata.style)}>
                            <Icon className="size-4" aria-hidden="true" />
                        </span>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    {activity.title}
                                </h3>
                                <Badge variant="outline" className="rounded-full border-border bg-background px-2 py-0 text-[10px] font-normal text-muted-foreground">
                                    {metadata.label}
                                </Badge>
                                {activity.report_code && (
                                    <span className="font-mono text-[10px] text-muted-foreground">
                                        #{activity.report_code}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {activity.description}
                            </p>

                            {activity.change && (
                                <p className="mt-2 inline-flex rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
                                    Status: {activity.change}
                                </p>
                            )}

                            {activity.verification_change && (
                                <p className="mt-2 inline-flex rounded-md bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                    Verifikasi: {activity.verification_change}
                                </p>
                            )}

                            {activity.context && (
                                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                    {activity.context}
                                </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                <span>{activity.actor}</span>
                                <span aria-hidden="true">·</span>
                                <time dateTime={activity.occurred_at}>{activity.time}</time>
                            </div>
                        </div>
                    </div>
                );

                return (
                    <li key={activity.id}>
                        {activity.href ? (
                            <Link href={activity.href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                {content}
                            </Link>
                        ) : content}
                    </li>
                );
            })}
        </ol>
    );
}
