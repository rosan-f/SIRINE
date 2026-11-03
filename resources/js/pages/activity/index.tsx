import { Head } from '@inertiajs/react';
import { Clock3 } from 'lucide-react';
import { index as activity } from '@/routes/activity';

export default function ActivityIndex() {
    return (
        <>
            <Head title="Riwayat Aktivitas" />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Riwayat Aktivitas
                </h1>

                <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-12 text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Clock3 className="size-8" aria-hidden="true" />
                    </div>

                    <p className="mt-6 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                        Coming Soon
                    </p>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                        Riwayat aktivitas segera hadir
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                        Kami sedang menyiapkan halaman untuk meninjau perubahan
                        status dan aktivitas penanganan laporan.
                    </p>
                </section>
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
