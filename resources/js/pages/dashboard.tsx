import { Head } from '@inertiajs/react';
import {
    Bot,
    CheckCircle2,
    ClipboardList,
    Clock3,
    Inbox,
    MapPin,
    MessageSquareText,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type ReportStatus =
    | 'Baru diterima'
    | 'Menunggu informasi'
    | 'Siap ditinjau'
    | 'Dalam pemeriksaan'
    | 'Terverifikasi';

const stats = [
    {
        label: 'Total laporan',
        value: '128',
        hint: '+18 laporan minggu ini',
        icon: ClipboardList,
        tone: 'bg-accent text-primary',
    },
    {
        label: 'Baru diterima',
        value: '12',
        hint: 'Menunggu pemeriksaan awal',
        icon: Inbox,
        tone: 'bg-muted text-muted-foreground',
    },
    {
        label: 'Menunggu informasi',
        value: '23',
        hint: '6 perlu pertanyaan lanjutan',
        icon: Clock3,
        tone: 'bg-muted text-muted-foreground',
    },
    {
        label: 'Siap ditinjau',
        value: '8',
        hint: 'Informasi utama sudah lengkap',
        icon: ShieldCheck,
        tone: 'bg-muted text-muted-foreground',
    },
];

const reportStatusStyles: Record<ReportStatus, string> = {
    'Baru diterima':
        'border-border bg-accent text-accent-foreground dark:border-border',
    'Menunggu informasi':
        'border-border bg-muted text-muted-foreground dark:border-border',
    'Siap ditinjau':
        'border-border bg-muted text-foreground dark:border-border',
    'Dalam pemeriksaan':
        'border-border bg-muted text-muted-foreground dark:border-border',
    Terverifikasi:
        'border-border bg-accent text-accent-foreground dark:border-border',
};

const recentReports: {
    code: string;
    type: string;
    location: string;
    status: ReportStatus;
    time: string;
}[] = [
    {
        code: 'ST-20261103-0001',
        type: 'Kecelakaan lalu lintas',
        location: 'Jl. Merdeka, Bandung',
        status: 'Baru diterima',
        time: '5 menit lalu',
    },
    {
        code: 'ST-20261103-0002',
        type: 'Kebakaran lahan',
        location: 'Cibiru, Bandung',
        status: 'Menunggu informasi',
        time: '18 menit lalu',
    },
    {
        code: 'ST-20261103-0003',
        type: 'Pohon tumbang',
        location: 'Jl. Ahmad Yani, Bandung',
        status: 'Siap ditinjau',
        time: '42 menit lalu',
    },
    {
        code: 'ST-20261103-0004',
        type: 'Banjir jalanan',
        location: 'Sukajadi, Bandung',
        status: 'Dalam pemeriksaan',
        time: '1 jam lalu',
    },
    {
        code: 'ST-20261103-0005',
        type: 'Kecelakaan lalu lintas',
        location: 'Antapani, Bandung',
        status: 'Terverifikasi',
        time: '2 jam lalu',
    },
];

const statusSummary = [
    {
        label: 'Baru diterima',
        value: 12,
        percent: 9,
        bar: 'bg-primary',
    },
    {
        label: 'Menunggu informasi',
        value: 23,
        percent: 18,
        bar: 'bg-primary/40',
    },
    {
        label: 'Siap ditinjau',
        value: 8,
        percent: 6,
        bar: 'bg-primary/60',
    },
    {
        label: 'Dalam pemeriksaan',
        value: 31,
        percent: 24,
        bar: 'bg-neutral-400',
    },
    {
        label: 'Terverifikasi',
        value: 54,
        percent: 43,
        bar: 'bg-primary',
    },
];

const activities = [
    {
        icon: Bot,
        text: 'AI selesai memeriksa kelengkapan laporan ST-20261103-0001.',
        time: '4 menit lalu',
        tone: 'bg-accent text-primary',
    },
    {
        icon: MessageSquareText,
        text: 'Laporan baru masuk melalui WhatsApp dari nomor +62 812-****-4412.',
        time: '18 menit lalu',
        tone: 'bg-muted text-muted-foreground',
    },
    {
        icon: CheckCircle2,
        text: 'Admin menandai laporan ST-20261103-0003 siap ditinjau.',
        time: '42 menit lalu',
        tone: 'bg-muted text-muted-foreground',
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Dashboard
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                            Pantau laporan yang masuk melalui WhatsApp dan
                            tinjau laporan yang membutuhkan perhatian.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary" />
                        WhatsApp terhubung
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className="gap-4 rounded-xl border-border py-5 shadow-none"
                        >
                            <CardContent className="px-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                                            stat.tone,
                                        )}
                                    >
                                        <stat.icon className="size-4.5" />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {stat.hint}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                    <Card className="gap-0 overflow-hidden rounded-xl border-border shadow-none">
                        <CardHeader className="flex-row items-center justify-between gap-4 border-b border-border pb-4">
                            <div>
                                <CardTitle className="text-base">
                                    Laporan terbaru
                                </CardTitle>
                                <CardDescription>
                                    Lima laporan terakhir dari kanal WhatsApp.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="rounded-full border-border text-[11px] font-normal text-muted-foreground"
                            >
                                Data contoh
                            </Badge>
                        </CardHeader>

                        <CardContent className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-160 text-left text-sm">
                                    <thead className="text-[11px] tracking-wider text-muted-foreground uppercase">
                                        <tr className="border-b border-border">
                                            <th className="px-5 py-3 font-medium">
                                                Kode
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Kejadian
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="hidden px-5 py-3 font-medium lg:table-cell">
                                                Masuk
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentReports.map((report) => (
                                            <tr
                                                key={report.code}
                                                className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                                            >
                                                <td className="px-5 py-3.5 font-medium whitespace-nowrap text-foreground">
                                                    {report.code}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="font-medium text-foreground">
                                                        {report.type}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <MapPin className="size-3" />
                                                        {report.location}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'rounded-full px-2.5 font-medium',
                                                            reportStatusStyles[
                                                                report.status
                                                            ],
                                                        )}
                                                    >
                                                        {report.status}
                                                    </Badge>
                                                </td>
                                                <td className="hidden px-5 py-3.5 text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                                                    {report.time}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="gap-4 rounded-xl border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Status laporan
                                </CardTitle>
                                <CardDescription>
                                    Distribusi seluruh laporan yang tersimpan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {statusSummary.map((item) => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {item.value}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    item.bar,
                                                )}
                                                style={{
                                                    width: `${item.percent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="gap-4 rounded-xl border-border shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Aktivitas terbaru
                                </CardTitle>
                                <CardDescription>
                                    Pembaruan dari sistem dan admin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.text}
                                        className="flex gap-3"
                                    >
                                        <div
                                            className={cn(
                                                'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                                                activity.tone,
                                            )}
                                        >
                                            <activity.icon className="size-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm leading-snug text-foreground">
                                                {activity.text}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
