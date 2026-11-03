import { Head } from '@inertiajs/react';
import { index as reports } from '@/routes/reports';

export default function ReportsIndex() {
    return (
        <>
            <Head title="Laporan" />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Laporan
                </h1>
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
