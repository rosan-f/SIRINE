import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    CheckCircle2,
    ClipboardList,
    Clock3,
    ExternalLink,
    Inbox,
    MapPin,
    Play,
    RefreshCw,
    ShieldCheck,
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
    | 'menunggu_informasi'
    | 'siap_ditinjau'
    | 'dalam_pemeriksaan'
    | 'menuju_lokasi'
    | 'dalam_penanganan'
    | 'selesai'
    | string;

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
        baru_diterima: number;
        sedang_ditangani: number;
        selesai: number;
        terverifikasi: number;
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
    menunggu_informasi: 'Menunggu informasi',
    siap_ditinjau: 'Siap ditinjau',
    dalam_pemeriksaan: 'Dalam pemeriksaan',
    menuju_lokasi: 'Petugas Menuju Lokasi',
    dalam_penanganan: 'Dalam Penanganan',
    selesai: 'Selesai Ditangani',
};

const statusStyles: Record<string, string> = {
    baru_diterima: 'bg-muted text-muted-foreground border-border',
    menunggu_informasi: 'bg-muted text-muted-foreground border-border',
    siap_ditinjau: 'bg-accent text-accent-foreground border-border',
    dalam_pemeriksaan: 'bg-secondary text-secondary-foreground border-border',
    menuju_lokasi: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dalam_penanganan: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    selesai: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

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
            } catch (err) {
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
            hint: `${stats.terverifikasi} telah diverifikasi`,
            icon: ClipboardList,
            style: 'text-primary',
        },
        {
            label: 'Baru Diterima',
            value: stats.baru_diterima,
            hint: 'Menunggu peninjauan petugas',
            icon: Inbox,
            style: 'text-muted-foreground',
        },
        {
            label: 'Sedang Ditangani',
            value: stats.sedang_ditangani,
            hint: 'Petugas aktif di lapangan',
            icon: Truck,
            style: 'text-blue-500',
        },
        {
            label: 'Selesai Ditangani',
            value: stats.selesai,
            hint: 'Penanganan tuntas',
            icon: CheckCircle2,
            style: 'text-emerald-500',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Dashboard Pemantauan SIGAP
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Pantau laporan darurat yang masuk melalui bot Telegram dan kendalikan proses integrasi secara terpusat.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs">
                        <span
                            className={cn(
                                'size-2 rounded-full',
                                isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400',
                            )}
                        />
                        <span className="font-medium text-foreground">
                            Bot Telegram: {isRunning ? 'Aktif Berjalan' : 'Berhenti'}
                        </span>
                        {pid && <span className="text-muted-foreground">(PID: {pid})</span>}
                    </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {topCards.map((stat) => (
                        <Card
                            key={stat.label}
                            className="gap-4 rounded-xl border-border py-5 shadow-none"
                        >
                            <CardContent className="px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.hint}
                                        </p>
                                    </div>

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <stat.icon className={cn('size-5', stat.style)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main 2-Column: Left (Recent Reports & Summary) | Right (Live Poller Logs & Controls) */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column: Recent Reports */}
                    <div className="space-y-6">
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base font-semibold text-foreground">
                                        Laporan Kejadian Terbaru
                                    </CardTitle>
                                    <CardDescription>
                                        Daftar laporan riil yang baru masuk ke sistem.
                                    </CardDescription>
                                </div>

                                <Link href={reportsIndex()}>
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs cursor-pointer">
                                        Lihat Semua
                                        <ExternalLink className="size-3" />
                                    </Button>
                                </Link>
                            </CardHeader>

                            <CardContent>
                                {recentReports.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {recentReports.map((report) => (
                                            <Link
                                                key={report.code}
                                                href={`/laporan/${report.id}`}
                                                className="flex items-center justify-between py-3 transition-colors hover:bg-muted/20 px-2 rounded-lg"
                                            >
                                                <div className="min-w-0 flex-1 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm text-foreground">
                                                            {report.type}
                                                        </span>
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            #{report.code}
                                                        </span>
                                                    </div>

                                                    <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
                                                        <MapPin className="size-3 shrink-0" />
                                                        {report.location}
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'rounded-full text-xs font-normal',
                                                            statusStyles[report.status] || statusStyles.baru_diterima,
                                                        )}
                                                    >
                                                        {statusLabels[report.status] || report.status}
                                                    </Badge>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {report.time}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        Belum ada laporan masuk di database.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Summary Progress */}
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground">
                                    Distribusi Status Penanganan
                                </CardTitle>
                                <CardDescription>
                                    Persentase status penanganan seluruh laporan masuk.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {statusSummary.map((item) => (
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
                    <div>
                        <Card className="rounded-xl border-border shadow-none flex flex-col h-full">
                            <CardHeader className="pb-3 border-b border-border">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <Terminal className="size-4 text-primary" />
                                            Log Aktivitas Telegram (telegram:poll)
                                        </CardTitle>
                                        <CardDescription>
                                            Pantau proses background polling pesan masuk secara real-time.
                                        </CardDescription>
                                    </div>

                                    {/* Action Buttons: Start, Stop, Refresh */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleStartPoller}
                                            disabled={isRunning || isActionLoading}
                                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-8 text-xs"
                                        >
                                            <Play className="size-3.5 fill-current" />
                                            Mulai Poller
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleStopPoller}
                                            disabled={!isRunning || isActionLoading}
                                            className="inline-flex items-center gap-1.5 cursor-pointer h-8 text-xs"
                                        >
                                            <Square className="size-3.5 fill-current" />
                                            Hentikan
                                        </Button>

                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="outline"
                                            onClick={handleManualRefresh}
                                            disabled={isRefreshing}
                                            className="h-8 w-8 cursor-pointer"
                                            title="Segarkan Log"
                                        >
                                            <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0 flex-1 flex flex-col">
                                {/* Terminal Console Window */}
                                <div
                                    ref={logContainerRef}
                                    className="flex-1 min-h-120 max-h-140 overflow-y-auto bg-neutral-950 p-4 font-mono text-xs text-neutral-300 leading-relaxed space-y-1 rounded-b-xl selection:bg-neutral-800"
                                >
                                    <div className="text-neutral-500 pb-2 border-b border-neutral-800 mb-2 flex items-center justify-between">
                                        <span>Terminal SIGAP Daemon Poller</span>
                                        <span>Status: {isRunning ? 'RUNNING' : 'STOPPED'}</span>
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
