import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ClipboardList,
    ExternalLink,
    Inbox,
    MapPin,
    Play,
    RefreshCw,
    Square,
    Terminal,
    Truck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as reportsIndex } from '@/routes/reports';

type ReportStatus =
    | 'baru_diterima'
    | 'menuju_lokasi'
    | 'dalam_penanganan'
    | 'selesai';

type RecentReport = {
    id: number;
    code: string;
    type: string;
    location: string;
    status: ReportStatus;
    verification: string;
    time: string;
};

type StatusSummaryItem = {
    label: string;
    value: number;
    percent: number;
    bar: string;
};

interface DashboardProps {
    stats: {
        total: number;
        belum_diverifikasi: number;
        sedang_ditangani: number;
        selesai_ditangani: number;
        tidak_valid: number;
    };
    statusSummary: StatusSummaryItem[];
    recentReports: RecentReport[];
    poller: {
        is_running: boolean;
        pid: number | null;
        logs: string[];
    };
}

const statusLabels: Record<string, string> = {
    baru_diterima: 'Baru diterima',
    menuju_lokasi: 'Petugas Menuju Lokasi',
    dalam_penanganan: 'Dalam Penanganan',
    selesai: 'Selesai Ditangani',
};

const statusStyles: Record<string, string> = {
    baru_diterima: 'bg-muted text-muted-foreground border-border',
    menuju_lokasi: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dalam_penanganan: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    selesai: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const getStatusLabel = (report: RecentReport): string => report.verification === 'tidak_valid'
    ? 'Ditutup · tidak valid'
    : statusLabels[report.status] || report.status;

const getStatusStyle = (report: RecentReport): string => report.verification === 'tidak_valid'
    ? 'bg-destructive/10 text-destructive border-destructive/20'
    : statusStyles[report.status] || statusStyles.baru_diterima;

export default function Dashboard({
    stats,
    statusSummary,
    recentReports,
    poller,
}: DashboardProps) {
    const [isRunning, setIsRunning] = useState(poller.is_running);
    const [pid, setPid] = useState<number | null>(poller.pid);
    const [logs, setLogs] = useState<string[]>(poller.logs);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs ke paling bawah ketika logs bertambah
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Polling live logs setiap 4 detik
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch('/poller/logs');
                if (response.ok) {
                    const data = await response.json();
                    setIsRunning(data.is_running);
                    setPid(data.pid);
                    if (data.logs) {
                        setLogs(data.logs);
                    }
                }
            } catch {
                // Abaikan kesalahan koneksi berkala
            }
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleStartPoller = () => {
        setIsActionLoading(true);
        router.post(
            '/poller/start',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsActionLoading(false),
            },
        );
    };

    const handleStopPoller = () => {
        setIsActionLoading(true);
        router.post(
            '/poller/stop',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsActionLoading(false),
            },
        );
    };

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('/poller/logs');
            if (response.ok) {
                const data = await response.json();
                setIsRunning(data.is_running);
                setPid(data.pid);
                if (data.logs) {
                    setLogs(data.logs);
                }
            }
        } finally {
            setIsRefreshing(false);
        }
    };

    const topCards = [
        {
            label: 'Total Laporan',
            value: stats.total,
            hint: `${stats.belum_diverifikasi} belum diverifikasi · semua periode`,
            icon: ClipboardList,
            style: 'bg-primary/10 text-primary',
        },
        {
            label: 'Belum Diverifikasi',
            value: stats.belum_diverifikasi,
            hint: 'Menunggu peninjauan petugas',
            icon: Inbox,
            style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            label: 'Sedang Ditangani',
            value: stats.sedang_ditangani,
            hint: 'Dalam perjalanan atau menangani kejadian',
            icon: Truck,
            style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Selesai Ditangani',
            value: stats.selesai_ditangani,
            hint: `${stats.tidak_valid} laporan tidak valid dihitung terpisah`,
            icon: CheckCircle2,
            style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-7 bg-muted/20 p-4 md:p-8">
                {/* Header Section */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            Pusat operasi
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Dashboard Pemantauan SIRINE
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Pantau kebutuhan tindak lanjut, laporan terbaru, dan koneksi bot dari satu tempat.
                        </p>
                    </div>

                    <div className={cn(
                        'flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm',
                        isRunning ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/70 bg-card',
                    )}>
                        <span
                            className={cn(
                                'relative flex size-3 items-center justify-center rounded-full',
                                isRunning ? 'bg-emerald-500/20' : 'bg-muted',
                            )}
                        >
                            <span className={cn('size-1.5 rounded-full', isRunning ? 'animate-pulse bg-emerald-500' : 'bg-muted-foreground/50')} />
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Koneksi Telegram
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                {isRunning ? 'Bot sedang aktif' : 'Bot sedang berhenti'}
                            </p>
                        </div>
                        {pid && <Badge variant="outline" className="ml-1 rounded-full bg-background/70 font-mono text-[10px] text-muted-foreground">PID {pid}</Badge>}
                    </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {topCards.map((stat) => (
                        <Card
                            key={stat.label}
                            className="gap-4 rounded-2xl border-border/70 bg-card py-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <CardContent className="px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.hint}
                                        </p>
                                    </div>

                                    <div className={cn('flex size-11 items-center justify-center rounded-xl', stat.style)}>
                                        <stat.icon className="size-5" aria-hidden="true" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main 2-Column: Left (Recent Reports & Summary) | Right (Live Poller Logs & Controls) */}
                <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
                    {/* Left Column: Recent Reports */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold text-foreground">
                                        Laporan terbaru
                                    </CardTitle>
                                    <CardDescription>
                                        Laporan yang paling baru diterima oleh sistem.
                                    </CardDescription>
                                </div>

                                <Link href={reportsIndex()}>
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        Semua laporan
                                        <ExternalLink className="size-3" />
                                    </Button>
                                </Link>
                            </CardHeader>

                            <CardContent>
                                {recentReports.length > 0 ? (
                                    <div className="divide-y divide-border/70">
                                        {recentReports.map((report) => (
                                            <Link
                                                key={report.code}
                                                href={`/laporan/${report.id}`}
                                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-4 transition-colors hover:bg-muted/50"
                                            >
                                                <div className="min-w-0 flex-1 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {report.type}
                                                        </span>
                                                        <span className="font-mono text-[11px] text-muted-foreground">
                                                            #{report.code}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
                                                        <MapPin className="size-3 shrink-0" />
                                                        {report.location}
                                                    </p>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'rounded-full text-xs font-normal',
                                                            getStatusStyle(report),
                                                        )}
                                                    >
                                                        {getStatusLabel(report)}
                                                    </Badge>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {report.time}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                                        <Inbox className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
                                        <p className="mt-3 font-medium text-foreground">Belum ada laporan</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Laporan dari warga akan muncul di sini.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Summary Progress */}
                        <Card className="rounded-2xl border-border/70 bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground">
                                    Status Laporan
                                </CardTitle>
                                <CardDescription>
                                    Setiap bar menunjukkan bagian dari seluruh laporan. Data tidak valid ditampilkan terpisah.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {stats.total === 0 ? (
                                    <p className="py-4 text-sm text-muted-foreground">
                                        Belum ada laporan untuk ditampilkan.
                                    </p>
                                ) : statusSummary.map((item) => (
                                    <div key={item.label} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {item.value} laporan ({item.percent}%)
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn('h-full rounded-full transition-all', item.bar)}
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Telegram Poller Live Logs & Controls */}
                <div className="min-w-0">
                    <Card className="flex h-full flex-col rounded-2xl border-border/70 bg-card shadow-sm">
                        <CardHeader className="border-b border-border/70 pb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Terminal className="size-4" aria-hidden="true" />
                                            </span>
                                            Aktivitas bot
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Log proses penerimaan pesan Telegram.
                                        </CardDescription>
                                    </div>

                                    {/* Action Buttons: Start, Stop, Refresh */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleStartPoller}
                                            disabled={isRunning || isActionLoading}
                                            className="h-9 cursor-pointer bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                        >
                                            <Play className="size-3.5 fill-current" />
                                            {isActionLoading && !isRunning ? 'Menjalankan…' : 'Mulai bot'}
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleStopPoller}
                                            disabled={!isRunning || isActionLoading}
                                            className="h-9 cursor-pointer text-xs"
                                        >
                                            <Square className="size-3.5 fill-current" />
                                            {isActionLoading && isRunning ? 'Menghentikan…' : 'Hentikan'}
                                        </Button>

                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={handleManualRefresh}
                                            disabled={isRefreshing}
                                            className="size-9 cursor-pointer rounded-xl"
                                            title="Segarkan log"
                                            aria-label="Segarkan log"
                                        >
                                            <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex flex-1 flex-col p-0">
                                {/* Terminal Console Window */}
                                <div
                                    ref={logContainerRef}
                                    className="min-h-120 max-h-140 flex-1 space-y-1 overflow-y-auto rounded-b-2xl bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300 selection:bg-neutral-800"
                                >
                                    <div className="mb-3 flex items-center justify-between border-b border-neutral-800 pb-3 text-[11px]">
                                        <span className="text-neutral-400">LOG SISTEM</span>
                                        <span className={cn('rounded-full px-2 py-1 font-semibold', isRunning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400')}>
                                            {isRunning ? 'AKTIF' : 'BERHENTI'}
                                        </span>
                                    </div>

                                    {logs.length > 0 ? (
                                        logs.map((line, index) => {
                                            const isError = line.includes('ErrorException') || line.includes('Error') || line.includes('Exception');
                                            const isSuccess = line.includes('[SUKSES]') || line.includes('[READY]') || line.includes('berhasil');
                                            const isMessage = line.includes('[PESAN MASUK]');
                                            const isAction = line.includes('[ACTION]') || line.includes('[STATUS]');

                                            return (
                                                <div
                                                    key={index}
                                                    className={cn(
                                                        'font-mono break-all',
                                                        isError && 'text-red-400',
                                                        isSuccess && 'text-emerald-400',
                                                        isMessage && 'text-yellow-400',
                                                        isAction && 'text-blue-400',
                                                        !isError && !isSuccess && !isMessage && !isAction && 'text-neutral-300',
                                                    )}
                                                >
                                                    {line}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-neutral-500 italic">
                                            Belum ada log tercatat. Tekan Mulai Poller untuk menjalankan bot.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
