import { Head, Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    Clock3,
    Eye,
    Inbox,
    MapPin,
    Navigation,
    RotateCcw,
    Search,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { index as reports } from '@/routes/reports';

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

const verificationStyles: Record<string, string> = {
    belum_terkonfirmasi: 'bg-muted text-muted-foreground border-border',
    terverifikasi: 'bg-accent text-accent-foreground border-border',
    tidak_valid: 'bg-destructive/10 text-destructive border-destructive/20',
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

    const stats = [
        {
            label: 'Total laporan',
            value: reports.length,
            description: 'Semua laporan tersimpan',
            icon: ClipboardList,
            tone: 'text-primary bg-primary/10',
        },
        {
            label: 'Belum diverifikasi',
            value: unverifiedCount,
            description: 'Menunggu peninjauan petugas',
            icon: Inbox,
            tone: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
        },
        {
            label: 'Sedang ditangani',
            value: inProgressCount,
            description: 'Menuju lokasi atau ditangani',
            icon: Clock3,
            tone: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
        },
        {
            label: 'Selesai ditangani',
            value: completedCount,
            description: 'Laporan tidak valid dihitung terpisah',
            icon: ShieldCheck,
            tone: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
        },
        {
            label: 'Tidak valid',
            value: invalidCount,
            description: 'Tidak dihitung sebagai selesai ditangani',
            icon: ShieldAlert,
            tone: 'text-destructive bg-destructive/10',
        },
    ];
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
                            Pantau verifikasi dan tindak lanjut laporan warga. Ringkasan di bawah mencakup semua laporan.
                        </p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                        {reports.length} laporan tersimpan
                    </Badge>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="rounded-2xl border-border/70 bg-card py-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <CardContent className="px-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div className={cn('flex size-11 items-center justify-center rounded-xl', stat.tone)}>
                                        <stat.icon className="size-5" aria-hidden="true" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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

                    <div className="grid gap-3 p-4 md:hidden">
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <Card key={report.code} className="rounded-2xl border-border/70 py-0 shadow-sm">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-mono text-[11px] font-medium text-muted-foreground">
                                                    {report.code}
                                                </p>
                                                <h3 className="mt-1 font-semibold text-foreground">
                                                    {report.type}
                                                </h3>
                                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                                    Pelapor: {report.reporter}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={cn('shrink-0 rounded-full font-normal', getStatusStyle(report))}>
                                                {getStatusLabel(report)}
                                            </Badge>
                                        </div>

                                        <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-sm">
                                            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            <div className="min-w-0">
                                                <p className="line-clamp-2 text-foreground">{report.location}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{report.date}</p>
                                                {report.latitude !== null && report.longitude !== null && (
                                                    <a
                                                        href={report.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                    >
                                                        <Navigation className="size-3" aria-hidden="true" />
                                                        Buka rute
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <Badge variant="outline" className={cn('rounded-full font-normal', verificationStyles[report.verification] || verificationStyles.belum_terkonfirmasi)}>
                                                {verificationLabels[report.verification] || report.verification}
                                            </Badge>
                                            <Link href={`/laporan/${report.id}`}>
                                                <Button variant="outline" size="sm" className="rounded-xl">
                                                    <Eye className="size-3.5" aria-hidden="true" />
                                                    Detail
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
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
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-262.5 text-left text-sm">
                            <thead className="sticky top-0 z-10 bg-muted/80 text-xs uppercase tracking-wide text-muted-foreground backdrop-blur">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Kode Laporan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Kejadian
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Lokasi & Koordinat
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Tanggal Masuk
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Verifikasi
                                    </th>
                                    <th className="px-5 py-4 font-medium text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report.code}
                                            onClick={() => router.visit(`/laporan/${report.id}`)}
                                            className="border-t border-border transition-colors hover:bg-muted/30 cursor-pointer"
                                        >
                                            <td className="px-5 py-4 font-medium whitespace-nowrap text-foreground">
                                                <Link
                                                    href={`/laporan/${report.id}`}
                                                    className="hover:underline text-foreground"
                                                >
                                                    {report.code}
                                                </Link>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-foreground">
                                                    {report.type}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {report.reporter}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="line-clamp-1">{report.location}</span>
                                                </div>

                                                {report.latitude && report.longitude && (
                                                    <a
                                                        href={report.google_maps_url || `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                                                    >
                                                        <Navigation className="size-3" />
                                                        Rute Google Maps
                                                    </a>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                                                {report.date}
                                            </td>

                                            <td className="px-5 py-4">
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

                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'rounded-full font-normal',
                                                        verificationStyles[report.verification] || verificationStyles.belum_terkonfirmasi,
                                                    )}
                                                >
                                                    {verificationLabels[report.verification] || report.verification}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/laporan/${report.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="inline-flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Eye className="size-3.5" />
                                                        Buka Detail
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center"
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
