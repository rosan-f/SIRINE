
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Search,
    ClipboardList,
    Inbox,
    Clock3,
    ShieldCheck,
    RotateCcw,
    MapPin,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ReportStatus =
    | 'baru_diterima'
    | 'menunggu_informasi'
    | 'siap_ditinjau'
    | 'dalam_pemeriksaan';

type Report = {
    code: string;
    type: string;
    reporter: string;
    location: string;
    date: string;
    status: ReportStatus;
    completeness: 'Lengkap' | 'Belum lengkap';
};

const reports: Report[] = [
    {
        code: 'ST-20261103-0001',
        type: 'Kecelakaan lalu lintas',
        reporter: 'Pelapor 001',
        location: 'Jl. Merdeka, Langsa',
        date: '03 Nov 2026, 10.15',
        status: 'baru_diterima',
        completeness: 'Belum lengkap',
    },
    {
        code: 'ST-20261103-0002',
        type: 'Kebakaran',
        reporter: 'Pelapor 002',
        location: 'Langsa Baro, Langsa',
        date: '03 Nov 2026, 09.45',
        status: 'menunggu_informasi',
        completeness: 'Belum lengkap',
    },
    {
        code: 'ST-20261103-0003',
        type: 'Pohon tumbang',
        reporter: 'Pelapor 003',
        location: 'Jl. Ahmad Yani, Langsa',
        date: '03 Nov 2026, 09.20',
        status: 'siap_ditinjau',
        completeness: 'Lengkap',
    },
    {
        code: 'ST-20261103-0004',
        type: 'Banjir',
        reporter: 'Pelapor 004',
        location: 'Langsa Lama, Langsa',
        date: '03 Nov 2026, 08.50',
        status: 'dalam_pemeriksaan',
        completeness: 'Lengkap',
    },
    {
        code: 'ST-20261103-0005',
        type: 'Kecelakaan lalu lintas',
        reporter: 'Pelapor 005',
        location: 'Langsa Kota, Langsa',
        date: '03 Nov 2026, 08.30',
        status: 'menunggu_informasi',
        completeness: 'Belum lengkap',
    },
    {
        code: 'ST-20261103-0006',
        type: 'Kebakaran',
        reporter: 'Pelapor 006',
        location: 'Langsa Timur, Langsa',
        date: '03 Nov 2026, 08.10',
        status: 'dalam_pemeriksaan',
        completeness: 'Lengkap',
    },
    {
        code: 'ST-20261103-0007',
        type: 'Banjir',
        reporter: 'Pelapor 007',
        location: 'Langsa Barat, Langsa',
        date: '03 Nov 2026, 07.45',
        status: 'baru_diterima',
        completeness: 'Belum lengkap',
    },
];

const statusLabels: Record<ReportStatus, string> = {
    baru_diterima: 'Baru diterima',
    menunggu_informasi: 'Menunggu informasi',
    siap_ditinjau: 'Siap ditinjau',
    dalam_pemeriksaan: 'Dalam pemeriksaan',
};

const statusStyles: Record<ReportStatus, string> = {
    baru_diterima:
        'border-border bg-accent text-accent-foreground',
    menunggu_informasi:
        'border-border bg-muted text-muted-foreground',
    siap_ditinjau:
        'border-border bg-secondary text-secondary-foreground',
    dalam_pemeriksaan:
        'border-border bg-muted text-foreground',
};

export default function ReportsIndex() {
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
                statusFilter === 'semua' ||
                report.status === statusFilter;

            const matchesType =
                typeFilter === 'semua' ||
                report.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [search, statusFilter, typeFilter]);

    const stats = [
        {
            label: 'Total laporan',
            value: reports.length,
            icon: ClipboardList,
        },
        {
            label: 'Baru diterima',
            value: reports.filter(
                (report) => report.status === 'baru_diterima',
            ).length,
            icon: Inbox,
        },
        {
            label: 'Menunggu informasi',
            value: reports.filter(
                (report) => report.status === 'menunggu_informasi',
            ).length,
            icon: Clock3,
        },
        {
            label: 'Siap ditinjau',
            value: reports.filter(
                (report) => report.status === 'siap_ditinjau',
            ).length,
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

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Laporan
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Kelola dan pantau seluruh laporan kejadian yang masuk.
                    </p>
                </div>

                {/* Statistics */}
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
                                        <p className="mt-2 text-2xl font-semibold tracking-tight">
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

                {/* Report Table */}
                <Card className="gap-0 overflow-hidden rounded-xl border-border py-0 shadow-none">
                    <div className="border-b border-border p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-foreground">
                                    Daftar laporan
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Daftar laporan kejadian yang diterima sistem.
                                </p>
                            </div>

                            <Badge
                                variant="outline"
                                className="rounded-full font-normal"
                            >
                                Data contoh
                            </Badge>
                        </div>

                        {/* Search and Filter */}
                        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari kode, kejadian, lokasi, atau pelapor..."
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
                                <option value="Kecelakaan lalu lintas">
                                    Kecelakaan
                                </option>
                                <option value="Kebakaran">Kebakaran</option>
                                <option value="Banjir">Banjir</option>
                                <option value="Pohon tumbang">
                                    Pohon tumbang
                                </option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua status</option>
                                {Object.entries(statusLabels).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-muted/40 text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Kode laporan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Jenis kejadian
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Lokasi
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Tanggal masuk
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Kelengkapan
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report.code}
                                            className="border-t border-border transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-5 py-4 font-medium whitespace-nowrap">
                                                {report.code}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-medium text-foreground">
                                                    {report.type}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {report.reporter}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <MapPin className="size-3.5 shrink-0" />
                                                    {report.location}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                                                {report.date}
                                            </td>

                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full font-normal"
                                                >
                                                    {report.completeness}
                                                </Badge>
                                            </td>

                                            <td className="px-5 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'rounded-full font-normal',
                                                        statusStyles[report.status],
                                                    )}
                                                >
                                                    {statusLabels[report.status]}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardList className="size-8 text-muted-foreground" />
                                                <p className="font-medium text-foreground">
                                                    Laporan tidak ditemukan
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Coba ubah kata kunci atau filter pencarian.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-4">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan {filteredReports.length} dari {reports.length} laporan contoh
                        </p>
                    </div>
                </Card>
            </div>
        </>
    );
}
