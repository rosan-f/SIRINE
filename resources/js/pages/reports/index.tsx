import { Head, Link, router } from '@inertiajs/react';
import {
    Inbox,
    MapPin,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as reports, show as showReport } from '@/routes/reports';

type ReportStatus =
    | 'baru_diterima'
    | 'menuju_lokasi'
    | 'dalam_penanganan'
    | 'selesai';

type VerificationStatus =
    | 'belum_terkonfirmasi'
    | 'terverifikasi'
    | 'tidak_valid';

export type Report = {
    id: number;
    code: string;
    type: string;
    reporter: string;
    reporter_phone?: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    google_maps_url: string | null;
    date: string;
    status: ReportStatus;
    verification: VerificationStatus;
    completeness: 'complete' | 'incomplete';
    summary?: string | null;
    victim_count?: number | null;
    victim_condition?: string | null;
    description?: string | null;
    original_text?: string | null;
    input_type?: 'text' | 'voice';
};

const statusLabels: Record<string, string> = {
    baru_diterima: 'Baru diterima',
    menuju_lokasi: 'Petugas menuju lokasi',
    dalam_penanganan: 'Dalam penanganan',
    selesai: 'Selesai ditangani',
};

const statusStyles: Record<string, string> = {
    baru_diterima: 'bg-muted text-muted-foreground border-border',
    menuju_lokasi: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    dalam_penanganan: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    selesai: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const verificationLabels: Record<string, string> = {
    belum_terkonfirmasi: 'Belum diverifikasi',
    terverifikasi: 'Terverifikasi',
    tidak_valid: 'Tidak valid',
};

const getStatusLabel = (report: Report): string => report.verification === 'tidak_valid'
    ? 'Ditutup · tidak valid'
    : statusLabels[report.status] || report.status;

const getStatusStyle = (report: Report): string => report.verification === 'tidak_valid'
    ? 'bg-destructive/10 text-destructive border-destructive/20'
    : statusStyles[report.status] || statusStyles.baru_diterima;

interface ReportsIndexProps {
    reports?: Report[];
}

export default function ReportsIndex({ reports = [] }: ReportsIndexProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('semua');
    const [typeFilter, setTypeFilter] = useState('semua');
    const [verificationFilter, setVerificationFilter] = useState('semua');
    const [quickFilter, setQuickFilter] = useState('semua');

    const unverifiedCount = reports.filter(
        (report) => report.verification === 'belum_terkonfirmasi',
    ).length;
    const inProgressCount = reports.filter((report) =>
        ['menuju_lokasi', 'dalam_penanganan'].includes(report.status),
    ).length;
    const completedCount = reports.filter(
        (report) =>
            report.status === 'selesai' && report.verification !== 'tidak_valid',
    ).length;
    const invalidCount = reports.filter(
        (report) => report.verification === 'tidak_valid',
    ).length;

    const quickFilters = [
        { value: 'semua', label: 'Semua laporan', count: reports.length },
        { value: 'perlu_ditinjau', label: 'Perlu ditinjau', count: unverifiedCount },
        { value: 'sedang_ditangani', label: 'Sedang ditangani', count: inProgressCount },
        { value: 'selesai_ditangani', label: 'Selesai', count: completedCount },
        { value: 'tidak_valid', label: 'Tidak valid', count: invalidCount },
    ];

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const keyword = search.toLowerCase();

            const matchesSearch =
                report.code.toLowerCase().includes(keyword) ||
                report.type.toLowerCase().includes(keyword) ||
                report.location.toLowerCase().includes(keyword) ||
                report.reporter.toLowerCase().includes(keyword);

            const matchesStatus = statusFilter === 'semua'
                || (statusFilter === 'sedang_ditangani'
                    ? ['menuju_lokasi', 'dalam_penanganan'].includes(report.status)
                    : statusFilter === 'selesai_ditangani'
                      ? report.status === 'selesai' && report.verification !== 'tidak_valid'
                    : report.status === statusFilter);

            const matchesVerification = verificationFilter === 'semua'
                || report.verification === verificationFilter;

            const matchesType =
                typeFilter === 'semua' || report.type === typeFilter;

            return matchesSearch && matchesStatus && matchesVerification && matchesType;
        });
    }, [reports, search, statusFilter, verificationFilter, typeFilter]);

    const filteredInvalidCount = filteredReports.filter(
        (report) => report.verification === 'tidak_valid',
    ).length;

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('semua');
        setTypeFilter('semua');
        setVerificationFilter('semua');
        setQuickFilter('semua');
    };

    const applyQuickFilter = (filter: string) => {
        setSearch('');
        setTypeFilter('semua');
        setStatusFilter('semua');
        setVerificationFilter('semua');
        setQuickFilter(filter);

        if (filter === 'perlu_ditinjau' || filter === 'tidak_valid') {
            setVerificationFilter(filter === 'perlu_ditinjau' ? 'belum_terkonfirmasi' : 'tidak_valid');
        } else if (filter === 'sedang_ditangani' || filter === 'selesai_ditangani') {
            setStatusFilter(filter);
        }
    };

    const hasActiveFilters = search !== ''
        || statusFilter !== 'semua'
        || verificationFilter !== 'semua'
        || typeFilter !== 'semua';

    return (
        <>
            <Head title="Laporan" />

            <div className="flex h-full min-w-0 flex-1 flex-col gap-7 bg-muted/20 p-4 md:p-8">
                {/* Page Header */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            Pusat operasi
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Laporan Kejadian
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Tinjau laporan warga, verifikasi informasi, dan pantau tindak lanjut.
                        </p>
                    </div>
                </div>

                {/* Report Table Card */}
                <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                    <div className="border-b border-border/70 p-5 md:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Daftar laporan
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Pilih laporan untuk melihat kronologi dan tindak lanjut.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="rounded-full border-border bg-muted/50 font-normal text-muted-foreground">
                                    {filteredReports.length} dari {reports.length} ditampilkan
                                </Badge>
                                <Badge variant="outline" className="rounded-full border-destructive/20 bg-destructive/5 font-normal text-destructive">
                                    {filteredInvalidCount} tidak valid
                                </Badge>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter cepat laporan">
                            {quickFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    aria-pressed={quickFilter === filter.value}
                                    onClick={() => applyQuickFilter(filter.value)}
                                    className={cn(
                                        'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        quickFilter === filter.value
                                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    {filter.label}
                                    <span className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                                        quickFilter === filter.value ? 'bg-primary-foreground/15 text-primary-foreground' : 'bg-muted text-muted-foreground',
                                    )}>
                                        {filter.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_auto_auto_auto_auto]">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />

                                <input
                                    type="text"
                                    aria-label="Cari laporan"
                                    placeholder="Cari kode, kejadian, lokasi, atau pelapor"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setQuickFilter('manual');
                                    }}
                                    className="h-10 w-full rounded-xl border border-input bg-background pr-3 pl-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                aria-label="Filter jenis kejadian"
                                onChange={(event) => {
                                    setTypeFilter(event.target.value);
                                    setQuickFilter('manual');
                                }}
                                className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua jenis kejadian</option>
                                <option value="Kecelakaan lalu lintas">Kecelakaan lalu lintas</option>
                                <option value="Kebakaran">Kebakaran</option>
                                <option value="Banjir">Banjir</option>
                                <option value="Pohon tumbang">Pohon tumbang</option>
                            </select>

                            <select
                                value={statusFilter}
                                aria-label="Filter status laporan"
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setQuickFilter('manual');
                                }}
                                className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua status</option>
                                <option value="sedang_ditangani">Sedang ditangani</option>
                                <option value="selesai_ditangani">Selesai ditangani</option>
                                {Object.entries(statusLabels).filter(([value]) => value !== 'selesai').map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={verificationFilter}
                                aria-label="Filter verifikasi laporan"
                                onChange={(event) => {
                                    setVerificationFilter(event.target.value);
                                    setQuickFilter('manual');
                                }}
                                className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua verifikasi</option>
                                {Object.entries(verificationLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <Button type="button" variant="outline" onClick={resetFilters} className="h-10 rounded-xl">
                                    <RotateCcw className="size-4" aria-hidden="true" />
                                    Reset filter
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-3 p-4 lg:hidden">
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <Link
                                    key={report.code}
                                    href={showReport(report.id)}
                                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <Card className="h-full rounded-2xl border-border/70 py-0 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20">
                                        <CardContent className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-mono text-[11px] font-medium text-muted-foreground">
                                                        {report.code}
                                                    </p>
                                                    <h3 className="mt-1 line-clamp-2 font-semibold text-foreground">
                                                        {report.type}
                                                    </h3>
                                                </div>
                                                <Badge variant="outline" className={cn('shrink-0 rounded-full font-normal', getStatusStyle(report))}>
                                                    {getStatusLabel(report)}
                                                </Badge>
                                            </div>

                                            <div className="flex min-w-0 items-start gap-2 border-t border-border/70 pt-3 text-sm">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                                <div className="min-w-0">
                                                    <p className="line-clamp-2 text-foreground">{report.location}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{report.date}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                                <Inbox className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
                                <p className="mt-3 font-medium text-foreground">
                                    {reports.length === 0 ? 'Belum ada laporan' : 'Laporan tidak ditemukan'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {reports.length === 0 ? 'Laporan yang dikirim warga akan muncul di sini.' : 'Coba ubah kata kunci atau filter yang dipilih.'}
                                </p>
                                {hasActiveFilters && (
                                    <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="mt-4 rounded-xl">
                                        Reset filter
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="hidden lg:block">
                        <table className="w-full table-fixed text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-muted/80 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                                <tr>
                                    <th className="w-[20%] px-4 py-4 font-medium xl:w-[16%] xl:px-5">
                                        Kode
                                    </th>
                                    <th className="w-[28%] px-4 py-4 font-medium xl:w-[22%] xl:px-5">
                                        Kejadian
                                    </th>
                                    <th className="w-[32%] px-4 py-4 font-medium xl:w-[30%] xl:px-5">
                                        Lokasi
                                    </th>
                                    <th className="hidden w-[16%] px-4 py-4 font-medium xl:table-cell xl:px-5">
                                        Tanggal
                                    </th>
                                    <th className="w-[20%] px-4 py-4 font-medium xl:w-[16%] xl:px-5">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report.code}
                                            onClick={() => router.visit(showReport.url(report.id))}
                                            className="cursor-pointer border-t border-border transition-colors hover:bg-muted/30 focus-within:bg-muted/30"
                                        >
                                            <td className="truncate px-4 py-4 font-medium text-foreground xl:px-5">
                                                <Link
                                                    href={showReport(report.id)}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="rounded-sm text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    {report.code}
                                                </Link>
                                            </td>

                                            <td className="truncate px-4 py-4 xl:px-5">
                                                <p className="truncate font-medium text-foreground">
                                                    {report.type}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-muted-foreground xl:px-5">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="line-clamp-2">{report.location}</span>
                                                </div>
                                            </td>

                                            <td className="hidden truncate px-4 py-4 text-muted-foreground xl:table-cell xl:px-5">
                                                {report.date}
                                            </td>

                                            <td className="px-4 py-4 xl:px-5">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'rounded-full font-normal',
                                                        getStatusStyle(report),
                                                    )}
                                                >
                                                    {getStatusLabel(report)}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-12 text-center xl:px-5"
                                        >
                                            <Inbox className="mx-auto mb-2 size-8 text-muted-foreground" />
                                            <p className="font-medium text-foreground">
                                                Belum ada laporan
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {reports.length === 0
                                                    ? 'Laporan yang dikirimkan warga melalui bot Telegram SIRINE akan otomatis muncul di sini.'
                                                    : 'Tidak ada laporan yang sesuai dengan filter pencarian.'}
                                            </p>
                                            {hasActiveFilters && (
                                                <Button type="button" variant="outline" size="sm" onClick={resetFilters} className="mt-4 rounded-xl">
                                                    Reset filter
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan {filteredReports.length} dari {reports.length} laporan
                        </p>
                    </div>
                </Card>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Laporan',
            href: reports(),
        },
    ],
};
