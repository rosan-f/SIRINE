import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Clock3,
    ExternalLink,
    FileText,
    History,
    MapPin,
    MessageSquare,
    Navigation,
    Phone,
    Send,
    Truck,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

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
import { index as reportsIndex, updateStatus as updateReportStatus } from '@/routes/reports';

type ReportDetail = {
    id: number;
    field_name: string;
    field_value: string;
    information_status: string;
};

type ReportMessage = {
    id: number;
    direction: 'inbound' | 'outbound';
    message_type: string;
    body: string;
    time: string;
};

type ReportHistoryItem = {
    id: number;
    admin_name: string;
    previous_status: string | null;
    new_status: string;
    previous_verification_status: string | null;
    new_verification_status: string | null;
    notes: string | null;
    created_at: string;
};

type Report = {
    id: number;
    code: string;
    type: string;
    reporter: {
        name: string;
        phone: string;
    };
    location: string;
    latitude: number | null;
    longitude: number | null;
    location_source: string;
    google_maps_url: string | null;
    date: string;
    incident_time: string;
    status: string;
    verification: string;
    completeness: 'complete' | 'incomplete';
    summary?: string | null;
    victim_count?: number | null;
    victim_condition?: string | null;
    description: string;
    original_text?: string | null;
    input_type?: 'text' | 'voice';
    details: ReportDetail[];
    messages: ReportMessage[];
    histories: ReportHistoryItem[];
};

interface ReportShowProps {
    report: Report;
}

const statusLabels: Record<string, string> = {
    baru_diterima: 'Baru diterima',
    menunggu_informasi: 'Menunggu informasi',
    siap_ditinjau: 'Siap ditinjau',
    dalam_pemeriksaan: 'Dalam pemeriksaan',
    menuju_lokasi: 'Petugas Menuju Lokasi',
    dalam_penanganan: 'Sedang Ditangani',
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

const verificationLabels: Record<string, string> = {
    belum_terkonfirmasi: 'Belum dikonfirmasi',
    terverifikasi: 'Terverifikasi',
    tidak_valid: 'Tidak valid',
};

const verificationStyles: Record<string, string> = {
    belum_terkonfirmasi: 'bg-muted text-muted-foreground border-border',
    terverifikasi: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    tidak_valid: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ReportShow({ report }: ReportShowProps) {
    const [customNotes, setCustomNotes] = useState('');
    const [submittingAction, setSubmittingAction] = useState<string | null>(null);

    const handleUpdateStatus = (action: string) => {
        setSubmittingAction(action);
        router.patch(
            updateReportStatus.url(report.id),
            {
                action,
                custom_notes: customNotes,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSubmittingAction(null);
                    setCustomNotes('');
                },
            },
        );
    };

    const mapsDirectionUrl =
        report.google_maps_url ||
        (report.latitude && report.longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`
            : null);

    return (
        <>
            <Head title={`Laporan #${report.code}`} />

            <div className="min-h-full bg-muted/20 px-4 py-5 md:px-8 md:py-7">
                <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 md:gap-6">
                    <Link href={reportsIndex()} className="inline-flex w-fit items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Kembali ke daftar laporan
                    </Link>

                    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm md:p-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs font-medium text-muted-foreground">
                                        #{report.code}
                                    </span>
                                    <Badge variant="secondary" className="rounded-full font-normal">
                                        {report.input_type === 'voice' ? 'Voice note' : 'Pesan teks'}
                                    </Badge>
                                    {report.completeness === 'incomplete' && (
                                        <Badge variant="outline" className="rounded-full border-amber-500/30 bg-amber-500/10 font-normal text-amber-700 dark:text-amber-300">
                                            Data belum lengkap
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                                        Detail laporan kejadian
                                    </p>
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                                        {report.type}
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                                    <span className="inline-flex items-center gap-2">
                                        <Clock3 className="size-4 shrink-0" aria-hidden="true" />
                                        Diterima {report.date}
                                    </span>
                                    <span className="sm:border-l sm:border-border sm:pl-5">
                                        Waktu kejadian: {report.incident_time}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 lg:max-w-72 lg:justify-end">
                                <Badge
                                    variant="outline"
                                    className={cn('rounded-full px-3 py-1.5 font-medium', statusStyles[report.status] || statusStyles.baru_diterima)}
                                >
                                    {statusLabels[report.status] || report.status}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={cn('rounded-full px-3 py-1.5 font-medium', verificationStyles[report.verification] || verificationStyles.belum_terkonfirmasi)}
                                >
                                    {verificationLabels[report.verification] || report.verification}
                                </Badge>
                            </div>
                        </div>
                    </section>

                    <Card className="gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                        <CardHeader className="border-b border-border/70 px-5 py-4 md:px-6">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                <Send className="size-4 text-primary" aria-hidden="true" />
                                Tindakan petugas
                            </CardTitle>
                            <CardDescription>
                                Perubahan status akan dikirim sebagai pemberitahuan ke Telegram pelapor.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 p-5 md:p-6">
                            <div className="space-y-2">
                                <label htmlFor="notes" className="text-sm font-medium text-foreground">
                                    Catatan untuk pelapor <span className="font-normal text-muted-foreground">(opsional)</span>
                                </label>
                                <input
                                    id="notes"
                                    type="text"
                                    placeholder="Contoh: Petugas sudah tiba di lokasi."
                                    value={customNotes}
                                    onChange={(event) => setCustomNotes(event.target.value)}
                                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                <Button
                                    type="button"
                                    onClick={() => handleUpdateStatus('dispatch')}
                                    disabled={submittingAction !== null || (report.verification === 'terverifikasi' && report.status === 'menuju_lokasi')}
                                    className="h-auto min-h-10 justify-start whitespace-normal rounded-xl px-3 py-2.5 text-left"
                                >
                                    <Truck className="size-4 shrink-0" aria-hidden="true" />
                                    {submittingAction === 'dispatch' ? 'Memproses…' : 'Verifikasi & kirim petugas'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus('complete')}
                                    disabled={submittingAction !== null || report.status === 'selesai'}
                                    className="h-auto min-h-10 justify-start whitespace-normal rounded-xl border-emerald-500/30 px-3 py-2.5 text-left text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                >
                                    <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                                    {submittingAction === 'complete' ? 'Memproses…' : 'Tandai selesai ditangani'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus('invalid')}
                                    disabled={submittingAction !== null || report.verification === 'tidak_valid'}
                                    className="h-auto min-h-10 justify-start whitespace-normal rounded-xl border-destructive/30 px-3 py-2.5 text-left text-destructive hover:bg-destructive/10 sm:col-span-2 xl:col-span-1"
                                >
                                    <XCircle className="size-4 shrink-0" aria-hidden="true" />
                                    {submittingAction === 'invalid' ? 'Memproses…' : 'Tandai tidak valid'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)] lg:gap-6">
                        <div className="min-w-0 space-y-5 md:space-y-6">
                            <Card className="gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                                <CardHeader className="px-5 pt-5 md:px-6">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                        <FileText className="size-4 text-primary" aria-hidden="true" />
                                        Informasi kejadian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 p-5 pt-4 md:px-6 md:pb-6">
                                    {report.summary && (
                                        <div className="rounded-xl bg-muted/50 p-4">
                                            <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                Ringkasan
                                            </p>
                                            <p className="text-sm leading-6 text-foreground">
                                                {report.summary}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h2 className="text-sm font-medium text-foreground">Kronologi</h2>
                                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                                            {report.description}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                                        <div className="rounded-xl bg-muted/40 p-3.5">
                                            <p className="text-xs text-muted-foreground">Kondisi korban</p>
                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {report.victim_condition || 'Nihil / Tidak ada korban'}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-muted/40 p-3.5">
                                            <p className="text-xs text-muted-foreground">Jumlah korban</p>
                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {report.victim_count != null ? `${report.victim_count} orang` : 'Belum diketahui'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                                <CardHeader className="px-5 pt-5 md:px-6">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                        <History className="size-4 text-primary" aria-hidden="true" />
                                        Riwayat penanganan
                                    </CardTitle>
                                    <CardDescription>
                                        Perubahan status dan verifikasi yang dilakukan petugas.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 pt-4 md:px-6 md:pb-6">
                                    {report.histories.length > 0 ? (
                                        <ol className="space-y-0">
                                            {report.histories.map((item, index) => (
                                                <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                                                    {index < report.histories.length - 1 && (
                                                        <span className="absolute top-8 bottom-0 left-3.75 w-px bg-border" aria-hidden="true" />
                                                    )}
                                                    <span className="relative z-10 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <Clock3 className="size-3.5" aria-hidden="true" />
                                                    </span>
                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                                                            <p className="text-sm font-medium text-foreground">{item.admin_name}</p>
                                                            <time className="text-xs text-muted-foreground">{item.created_at}</time>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge variant="outline" className="rounded-full font-normal">
                                                                {statusLabels[item.new_status] || item.new_status}
                                                            </Badge>
                                                            {item.new_verification_status && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'rounded-full font-normal',
                                                                        verificationStyles[item.new_verification_status] || verificationStyles.belum_terkonfirmasi,
                                                                    )}
                                                                >
                                                                    {verificationLabels[item.new_verification_status] || item.new_verification_status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {item.notes && (
                                                            <p className="break-words text-sm leading-5 text-muted-foreground">
                                                                {item.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                                            Belum ada perubahan status yang dicatat.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                                <CardContent className="p-5 md:p-6">
                                    <details className="group">
                                        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <MessageSquare className="size-4" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold text-foreground">Riwayat pesan Telegram</span>
                                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                                    {report.messages.length} pesan tersimpan · buka untuk melihat percakapan
                                                </span>
                                            </span>
                                            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                                        </summary>
                                        <div className="mt-5 space-y-3 border-t border-border pt-4">
                                            {report.messages.length > 0 ? report.messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'max-w-full rounded-xl border p-3 text-sm sm:max-w-[85%]',
                                                        message.direction === 'inbound'
                                                            ? 'border-border bg-muted/40 sm:mr-auto'
                                                            : 'border-primary/20 bg-primary/5 sm:ml-auto',
                                                    )}
                                                >
                                                    <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                                                        <span className="font-semibold text-foreground">
                                                            {message.direction === 'inbound' ? report.reporter.name : 'Bot SIRINE'}
                                                        </span>
                                                        <time className="text-muted-foreground">{message.time}</time>
                                                    </div>
                                                    <p className="break-words whitespace-pre-wrap leading-5 text-muted-foreground">
                                                        {message.body}
                                                    </p>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-muted-foreground">
                                                    Belum ada riwayat pesan tersimpan untuk laporan ini.
                                                </p>
                                            )}
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        </div>

                        <aside className="min-w-0 space-y-5 md:space-y-6">
                            <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                                <CardHeader className="px-5 pt-5 md:px-6">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                        <MapPin className="size-4 text-primary" aria-hidden="true" />
                                        Lokasi kejadian
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5 pt-3 md:px-6 md:pb-6">
                                    <p className="break-words text-sm leading-5 text-foreground">
                                        {report.location}
                                    </p>

                                    {report.latitude !== null && report.longitude !== null ? (
                                        <>
                                            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                                                <iframe
                                                    title={`Peta lokasi ${report.code}`}
                                                    className="h-52 w-full border-0 sm:h-60"
                                                    loading="lazy"
                                                    src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&hl=id&z=15&output=embed`}
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                                <span>Sumber: {report.location_source}</span>
                                                <span className="font-mono">
                                                    {report.latitude}, {report.longitude}
                                                </span>
                                            </div>
                                            {mapsDirectionUrl && (
                                                <a
                                                    href={mapsDirectionUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    <Navigation className="size-4" aria-hidden="true" />
                                                    Buka petunjuk rute
                                                    <ExternalLink className="size-3.5" aria-hidden="true" />
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                                            Titik koordinat GPS tidak tersedia.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="gap-0 rounded-2xl border-border/70 bg-card py-0 shadow-sm">
                                <CardHeader className="px-5 pt-5 md:px-6">
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                        <User className="size-4 text-primary" aria-hidden="true" />
                                        Pelapor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 p-5 pt-3 md:px-6 md:pb-6">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama</p>
                                        <p className="mt-1 text-sm font-medium text-foreground">
                                            {report.reporter.name}
                                        </p>
                                    </div>
                                    <div className="border-t border-border pt-3">
                                        <p className="text-xs text-muted-foreground">Nomor kontak Telegram</p>
                                        <p className="mt-1 flex items-start gap-2 break-all text-sm font-medium text-foreground">
                                            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            {report.reporter.phone}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}

ReportShow.layout = {
    breadcrumbs: [
        {
            title: 'Laporan',
            href: reportsIndex(),
        },
        {
            title: 'Detail Laporan',
        },
    ],
};
