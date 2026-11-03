import { Head } from '@inertiajs/react';
import { ExternalLink, Inbox, MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { map as reportMap } from '@/routes/reports';

type MapReport = {
    id: number;
    code: string;
    type: string;
    reporter: string;
    location: string;
    latitude: number;
    longitude: number;
    google_maps_url: string;
    date: string;
    status: string;
    summary?: string;
};

interface ReportsMapProps {
    reports?: MapReport[];
}

export default function ReportsMap({ reports = [] }: ReportsMapProps) {
    const [selectedReport, setSelectedReport] = useState<MapReport | null>(
        reports.length > 0 ? reports[0] : null,
    );

    return (
        <>
            <Head title="Peta Laporan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Peta Sebaran Laporan
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pantau sebaran koordinat kejadian darurat dan rute navigasi petugas di lapangan.
                    </p>
                </div>

                {reports.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Interactive Google Map Panel */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="overflow-hidden rounded-xl border-border p-0 shadow-none">
                                <div className="border-b border-border p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="size-4 text-primary" />
                                        <span className="font-medium text-sm text-foreground">
                                            {selectedReport
                                                ? `Lokasi: ${selectedReport.type} (${selectedReport.code})`
                                                : 'Pilih laporan di samping'}
                                        </span>
                                    </div>

                                    {selectedReport && (
                                        <a
                                            href={selectedReport.google_maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                                        >
                                            <Navigation className="size-3.5" />
                                            Buka Rute Langsung
                                            <ExternalLink className="size-3" />
                                        </a>
                                    )}
                                </div>

                                <div className="h-125 w-full bg-muted/20">
                                    {selectedReport ? (
                                        <iframe
                                            title="Peta Interaktif"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            src={`https://maps.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}&hl=id&z=15&output=embed`}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                            Pilih laporan untuk memuat peta
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Report Pins List */}
                        <div className="space-y-3">
                            <h2 className="font-semibold text-sm text-foreground">
                                Laporan Berkoordinat GPS ({reports.length})
                            </h2>

                            <div className="space-y-3 max-h-135 overflow-y-auto pr-1">
                                {reports.map((report) => (
                                    <div
                                        key={report.code}
                                        onClick={() => setSelectedReport(report)}
                                        className={`rounded-xl border p-4 transition-all cursor-pointer ${
                                            selectedReport?.code === report.code
                                                ? 'border-primary bg-primary/5 shadow-xs'
                                                : 'border-border bg-card hover:bg-muted/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-foreground">
                                                {report.code}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {report.type}
                                            </Badge>
                                        </div>

                                        <p className="mt-2 text-xs font-medium text-foreground line-clamp-1">
                                            {report.location}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Koordinat: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                                        </p>

                                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                                            <span className="text-muted-foreground">{report.date}</span>
                                            <a
                                                href={report.google_maps_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                                            >
                                                <Navigation className="size-3" />
                                                Petunjuk Rute
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="rounded-xl border-border p-12 text-center shadow-none">
                        <Inbox className="mx-auto mb-3 size-10 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground text-base">
                            Belum Ada Laporan dengan Koordinat GPS
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                            Ketika pelapor mengirimkan Share Location di Telegram, titik koordinat kejadian darurat dan rute navigasi akan otomatis terpeta di halaman ini.
                        </p>
                    </Card>
                )}
            </div>
        </>
    );
}

ReportsMap.layout = {
    breadcrumbs: [
        {
            title: 'Peta Laporan',
            href: reportMap(),
        },
    ],
};
