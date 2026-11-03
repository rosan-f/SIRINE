import { Head } from '@inertiajs/react';
import { map as reportMap } from '@/routes/reports';

export default function ReportsMap() {
    return (
        <>
            <Head title="Peta Laporan" />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Peta Laporan
                </h1>
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
