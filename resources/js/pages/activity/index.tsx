import { Head } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ActivityTimeline, type ActivityEvent, type ActivityType } from '@/components/activity-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as activity } from '@/routes/activity';

const filters: { value: 'all' | ActivityType; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'report_received', label: 'Laporan baru' },
    { value: 'verification', label: 'Verifikasi' },
    { value: 'handling', label: 'Penanganan' },
    { value: 'invalid', label: 'Tidak valid' },
    { value: 'processing_issue', label: 'Perlu ditindaklanjuti' },
    { value: 'bot', label: 'Bot Telegram' },
];

interface ActivityIndexProps {
    activities: ActivityEvent[];
}

export default function ActivityIndex({ activities }: ActivityIndexProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | ActivityType>('all');
    const [search, setSearch] = useState('');

    const filterCounts = useMemo(() => {
        return filters.map((filter) => ({
            ...filter,
            count: filter.value === 'all'
                ? activities.length
                : activities.filter((activityItem) => activityItem.type === filter.value).length,
        }));
    }, [activities]);

    const filteredActivities = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase();

        return activities.filter((activityItem) => {
            const matchesType = activeFilter === 'all' || activityItem.type === activeFilter;
            const searchableText = [
                activityItem.title,
                activityItem.description,
                activityItem.context,
                activityItem.actor,
                activityItem.report_code ?? '',
            ].join(' ').toLocaleLowerCase();

            return matchesType && (!keyword || searchableText.includes(keyword));
        });
    }, [activities, activeFilter, search]);

    const resetFilters = () => {
        setActiveFilter('all');
        setSearch('');
    };

    const hasActiveFilters = activeFilter !== 'all' || search.trim() !== '';

    return (
        <>
            <Head title="Riwayat Aktivitas" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-6 bg-muted/20 p-4 md:gap-7 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            Pusat operasi
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Riwayat aktivitas
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Pantau laporan baru, verifikasi, tindak lanjut petugas, dan koneksi bot Telegram.
                        </p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                        {activities.length} aktivitas terbaru
                    </Badge>
                </div>

                <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                    <div className="border-b border-border/70 p-4 md:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Aktivitas sistem dan laporan
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Pilih aktivitas untuk membuka laporan terkait.
                                </p>
                            </div>
                            {hasActiveFilters && (
                                <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="h-9 gap-2 text-xs">
                                    <RotateCcw className="size-3.5" />
                                    Reset filter
                                </Button>
                            )}
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter kategori aktivitas">
                            {filterCounts.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    aria-pressed={activeFilter === filter.value}
                                    onClick={() => setActiveFilter(filter.value)}
                                    className={cn(
                                        'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        activeFilter === filter.value
                                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {filter.label}
                                    <span className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                                        activeFilter === filter.value
                                            ? 'bg-primary-foreground/15 text-primary-foreground'
                                            : 'bg-muted text-muted-foreground',
                                    )}>
                                        {filter.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="relative mt-4 max-w-lg">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <input
                                type="search"
                                aria-label="Cari aktivitas"
                                placeholder="Cari aktivitas, kode laporan, lokasi, atau petugas"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="h-10 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="p-3 md:p-5">
                        {filteredActivities.length > 0 ? (
                            <ActivityTimeline activities={filteredActivities} />
                        ) : hasActiveFilters ? (
                            <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                                <p className="font-medium text-foreground">Aktivitas tidak ditemukan</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Coba kata kunci atau kategori lain.
                                </p>
                                <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                                    Hapus filter
                                </Button>
                            </div>
                        ) : (
                            <ActivityTimeline activities={[]} />
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}

ActivityIndex.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Aktivitas',
            href: activity(),
        },
    ],
};
