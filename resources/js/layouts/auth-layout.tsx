import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const highlights = [
    'Laporan terstruktur dari WhatsApp',
    'Pemeriksaan kelengkapan oleh AI',
    'Dashboard untuk meninjau laporan',
];

export default function AuthLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const year = new Date().getFullYear();

    return (
        <div className="min-h-svh bg-background lg:grid lg:grid-cols-2">
            <aside className="hidden border-r border-border bg-[#eef2ee] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
                <Link href={home()} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <AppLogoIcon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-foreground">
                        {name}
                    </span>
                </Link>

                <div className="max-w-sm">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Sampaikan laporan, permudah penanganan.
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {name} membantu masyarakat menyampaikan kejadian secara
                        terstruktur melalui WhatsApp, lalu merangkumnya untuk
                        ditinjau admin.
                    </p>

                    <ul className="mt-6 space-y-2.5">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="flex items-center gap-2.5 text-sm text-muted-foreground"
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                                    <Check className="size-3" />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-muted-foreground">
                    Pelengkap layanan darurat 119, bukan pengganti.
                </p>
            </aside>

            <main className="flex min-h-svh flex-col bg-background">
                <header className="flex items-center gap-3 border-b border-border px-5 py-4 lg:hidden">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <AppLogoIcon className="size-5" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight">
                        {name}
                    </span>
                </header>

                <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
                    <div className="w-full max-w-sm">
                        <div className="mb-6">
                            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            {children}
                        </div>

                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            © {year} {name}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
