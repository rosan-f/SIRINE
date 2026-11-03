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
    | 'menunggu_informasi'
    | 'siap_ditinjau'
    | 'dalam_pemeriksaan'
    | string;

type VerificationStatus =
    | 'belum_terkonfirmasi'
    | 'terverifikasi'
    | 'tidak_valid'
    | string;

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
    menunggu_informasi: 'Menunggu informasi',
    siap_ditinjau: 'Siap ditinjau',
    dalam_pemeriksaan: 'Dalam pemeriksaan',
};

const statusStyles: Record<string, string> = {
    baru_diterima: 'bg-muted text-muted-foreground border-border',
    menunggu_informasi: 'bg-muted text-muted-foreground border-border',
    siap_ditinjau: 'bg-accent text-accent-foreground border-border',
    dalam_pemeriksaan: 'bg-secondary text-secondary-foreground border-border',
};

const verificationLabels: Record<string, string> = {
    belum_terkonfirmasi: 'Belum dikonfirmasi',
    terverifikasi: 'Terverifikasi',
    tidak_valid: 'Tidak valid',
};

const verificationStyles: Record<string, string> = {
    belum_terkonfirmasi: 'bg-muted text-muted-foreground border-border',
    terverifikasi: 'bg-accent text-accent-foreground border-border',
    tidak_valid: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface ReportsIndexProps {
    reports?: Report[];
}

export default function ReportsIndex({ reports = [] }: ReportsIndexProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('semua');
    const [typeFilter, setTypeFilter] = useState('semua');

    const filteredReports = useMemo(() => {
        return reports.filter((report) => {
            const keyword = search.toLowerCase();

            const matchesSearch =
                report.code.toLowerCase().includes(keyword) ||
                report.type.toLowerCase().includes(keyword) ||
                report.location.toLowerCase().includes(keyword) ||
                report.reporter.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === 'semua' || report.status === statusFilter;

            const matchesType =
                typeFilter === 'semua' || report.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [reports, search, statusFilter, typeFilter]);

    const stats = [
        {
            label: 'Total laporan',
            value: reports.length,
            icon: ClipboardList,
        },
        {
            label: 'Baru diterima',
            value: reports.filter((r) => r.status === 'baru_diterima').length,
            icon: Inbox,
        },
        {
            label: 'Menunggu informasi',
            value: reports.filter((r) => r.status === 'menunggu_informasi').length,
            icon: Clock3,
        },
        {
            label: 'Siap ditinjau',
            value: reports.filter((r) => r.status === 'siap_ditinjau').length,
            icon: ShieldCheck,
        },
    ];

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('semua');
        setTypeFilter('semua');
    };

    return (
        <>
            <Head title="Laporan" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Laporan Kejadian
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola dan pantau seluruh laporan kejadian masuk dari warga melalui Telegram SIRINE.
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="rounded-xl border-border py-5 shadow-none"
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
                                    </div>

                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <stat.icon className="size-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Report Table Card */}
                <Card className="gap-0 overflow-hidden rounded-xl border-border py-0 shadow-none">
                    <div className="border-b border-border p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Daftar Laporan Masuk
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Data laporan real-time yang diterima dari bot Telegram.
                                </p>
                            </div>

                            <Badge
                                variant="outline"
                                className="rounded-full font-normal text-muted-foreground"
                            >
                                {reports.length} Laporan Tersimpan
                            </Badge>
                        </div>

                        {/* Search and Filters */}
                        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                                <input
                                    type="text"
                                    placeholder="Cari kode, jenis kejadian, lokasi, atau pelapor..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua jenis kejadian</option>
                                <option value="Kecelakaan lalu lintas">Kecelakaan lalu lintas</option>
                                <option value="Kebakaran">Kebakaran</option>
                                <option value="Banjir">Banjir</option>
                                <option value="Pohon tumbang">Pohon tumbang</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua status</option>
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-262.5 text-left text-sm">
                            <thead className="bg-muted/40 text-xs text-muted-foreground">
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
                                                        statusStyles[report.status] || statusStyles.baru_diterima,
                                                    )}
                                                >
                                                    {statusLabels[report.status] || report.status}
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
