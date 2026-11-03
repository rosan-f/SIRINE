import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    ExternalLink,
    History,
    MapPin,
    MessageSquare,
    Navigation,
    Phone,
    Send,
    ShieldAlert,
    ShieldCheck,
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
import { index as reportsIndex } from '@/routes/reports';

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
            `/laporan/${report.id}/status`,
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

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Navigation Back & Status Badges */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={reportsIndex()}>
                            <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                                <ArrowLeft className="size-4" />
                                Kembali ke Daftar Laporan
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn('rounded-full font-normal px-3 py-1', statusStyles[report.status] || statusStyles.baru_diterima)}
                        >
                            {statusLabels[report.status] || report.status}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn('rounded-full font-normal px-3 py-1', verificationStyles[report.verification] || verificationStyles.belum_terkonfirmasi)}
                        >
                            {verificationLabels[report.verification] || report.verification}
                        </Badge>
                    </div>
                </div>

                {/* Page Title & Main Overview */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground">
                                    #{report.code}
                                </span>
                                <Badge variant="secondary" className="font-normal text-xs">
                                    {report.input_type === 'voice' ? 'Voice Note' : 'Pesan Teks'}
                                </Badge>
                                <Badge variant="outline" className="font-normal text-xs">
                                    {report.completeness === 'complete' ? 'Data Lengkap' : 'Belum Lengkap'}
                                </Badge>
                            </div>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                {report.type}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                                <Clock3 className="size-4 shrink-0" />
                                Dilaporkan pada {report.date} (Kejadian: {report.incident_time})
                            </p>
                        </div>

                        {mapsDirectionUrl && (
                            <a
                                href={mapsDirectionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                            >
                                <Navigation className="size-4" />
                                Buka Rute di Google Maps
                                <ExternalLink className="size-3.5 ml-0.5" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Action Card: Konfirmasi & Kirim Pesan Petugas */}
                <Card className="rounded-xl border-2 border-primary/20 bg-primary/5 shadow-xs">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Send className="size-4 text-primary" />
                            Tindakan Petugas & Balasan Otomatis ke Telegram
                        </CardTitle>
                        <CardDescription>
                            Konfirmasi status laporan di bawah ini. Sistem akan langsung mengirimkan pesan pemberitahuan resmi ke Telegram pelapor tanpa emoticon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label
                                htmlFor="notes"
                                className="block text-xs font-medium text-muted-foreground mb-1.5"
                            >
                                Catatan Tambahan Petugas (Opsional - disertakan ke pesan Telegram):
                            </label>
                            <input
                                id="notes"
                                type="text"
                                placeholder="Contoh: Unit Damkar Pos 01 sedang meluncur dengan 2 armada..."
                                value={customNotes}
                                onChange={(e) => setCustomNotes(e.target.value)}
                                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Tombol Utama: Verifikasi & Petugas Menuju Lokasi */}
                            <Button
                                type="button"
                                onClick={() => handleUpdateStatus('dispatch')}
                                disabled={submittingAction !== null || (report.verification === 'terverifikasi' && report.status === 'menuju_lokasi')}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                            >
                                <Truck className="size-4" />
                                {submittingAction === 'dispatch'
                                    ? 'Memproses...'
                                    : 'Verifikasi & Kirim Petugas ke Lokasi'}
                            </Button>

                            {/* Tombol Selesai Ditangani */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleUpdateStatus('complete')}
                                disabled={submittingAction !== null || report.status === 'selesai'}
                                className="inline-flex items-center gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                            >
                                <CheckCircle2 className="size-4" />
                                {submittingAction === 'complete'
                                    ? 'Memproses...'
                                    : 'Tandai Selesai Ditangani'}
                            </Button>

                            {/* Tombol Laporan Tidak Valid */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleUpdateStatus('invalid')}
                                disabled={submittingAction !== null || report.verification === 'tidak_valid'}
                                className="inline-flex items-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer"
                            >
                                <XCircle className="size-4" />
                                {submittingAction === 'invalid'
                                    ? 'Memproses...'
                                    : 'Tandai Tidak Valid'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 2-Column Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left 2 Columns: Details, Description, Conversation, Histories */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary & Description Card */}
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <ShieldAlert className="size-4 text-primary" />
                                    Ringkasan & Keterangan Kejadian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {report.summary && (
                                    <div className="rounded-lg bg-muted/40 p-4 border border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Ringkasan Laporan
                                        </p>
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {report.summary}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Kronologi / Deskripsi Lengkap
                                    </p>
                                    <div className="rounded-lg border border-border p-4 bg-background text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {report.description}
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Kondisi Korban</p>
                                        <p className="text-sm font-medium text-foreground mt-0.5">
                                            {report.victim_condition || 'Nihil / Tidak ada korban'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Jumlah Korban Terdata</p>
                                        <p className="text-sm font-medium text-foreground mt-0.5">
                                            {report.victim_count !== null ? `${report.victim_count} orang` : 'Nihil / Belum diketahui'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status History Timeline */}
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <History className="size-4 text-primary" />
                                    Riwayat Penanganan & Tindakan Petugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {report.histories && report.histories.length > 0 ? (
                                    <div className="space-y-3">
                                        {report.histories.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-border p-3.5 bg-muted/20 text-sm"
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-1 text-xs">
                                                    <span className="font-semibold text-foreground">
                                                        {item.admin_name}
                                                    </span>
                                                    <span className="text-muted-foreground">{item.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                    <span>Status:</span>
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        {statusLabels[item.new_status] || item.new_status}
                                                    </Badge>
                                                </div>
                                                <p className="text-foreground text-xs leading-relaxed">
                                                    {item.notes}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Belum ada perubahan status yang dicatat.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Telegram Conversation History */}
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <MessageSquare className="size-4 text-primary" />
                                    Riwayat Interaksi Telegram
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {report.messages && report.messages.length > 0 ? (
                                    <div className="space-y-3">
                                        {report.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    'p-3.5 rounded-lg border text-sm max-w-[85%]',
                                                    msg.direction === 'inbound'
                                                        ? 'bg-muted/30 border-border mr-auto'
                                                        : 'bg-primary/5 border-primary/20 ml-auto',
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-4 mb-1 text-xs">
                                                    <span className="font-semibold text-foreground">
                                                        {msg.direction === 'inbound' ? report.reporter.name : 'Bot SIGAP'}
                                                    </span>
                                                    <span className="text-muted-foreground">{msg.time}</span>
                                                </div>
                                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                                    {msg.body}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Belum ada riwayat pesan tersimpan untuk laporan ini.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 1 Column: Location, Map, Reporter */}
                    <div className="space-y-6">
                        {/* Map & Location Card */}
                        <Card className="rounded-xl border-border shadow-none overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <MapPin className="size-4 text-primary" />
                                    Lokasi & Navigasi Petugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Patokan / Alamat Tempat</p>
                                    <p className="text-sm font-medium text-foreground">{report.location}</p>
                                </div>

                                {report.latitude && report.longitude ? (
                                    <>
                                        <div className="rounded-lg bg-muted/40 p-3 border border-border text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Sumber Lokasi:</span>
                                                <span className="font-medium text-foreground uppercase">
                                                    {report.location_source}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Latitude:</span>
                                                <span className="font-mono text-foreground">{report.latitude}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Longitude:</span>
                                                <span className="font-mono text-foreground">{report.longitude}</span>
                                            </div>
                                        </div>

                                        {/* Embedded Google Maps */}
                                        <div className="overflow-hidden rounded-lg border border-border h-64 w-full bg-muted/20">
                                            <iframe
                                                title={`Peta Lokasi ${report.code}`}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&hl=id&z=15&output=embed`}
                                            />
                                        </div>

                                        {mapsDirectionUrl && (
                                            <a
                                                href={mapsDirectionUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                                            >
                                                <Navigation className="size-4" />
                                                Petunjuk Rute Google Maps
                                                <ExternalLink className="size-3.5 ml-0.5" />
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                                        Titik koordinat GPS tidak disertakan pada laporan ini.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reporter Information Card */}
                        <Card className="rounded-xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Informasi Pelapor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Nama Pelapor</p>
                                    <p className="font-medium text-foreground mt-0.5">{report.reporter.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">WhatsApp / ID Telegram</p>
                                    <p className="font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                                        <Phone className="size-3.5 text-muted-foreground" />
                                        {report.reporter.phone}
                                    </p>
                                </div>
                                <div className="pt-2 border-t border-border">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ShieldCheck className="size-4 text-primary" />
                                        <span>Terverifikasi melalui akun Telegram aktif</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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
