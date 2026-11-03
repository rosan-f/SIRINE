import { Head } from '@inertiajs/react';
import { index as activity } from '@/routes/activity';

export default function ActivityIndex() {
    return (
        <>
            <Head title="Riwayat Aktivitas" />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Riwayat Aktivitas
                </h1>
            </div>
        </>
    );
}

ActivityIndex.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Aktivitas',
            href: activity(),
        },
    ],
};
