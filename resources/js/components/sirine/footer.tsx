import { Link } from '@inertiajs/react';
import { LaporButton } from './lapor-button';
import { Logo } from './logo';

const nav = [
    { href: '#beranda', label: 'Beranda' },
    { href: '#tentang', label: 'Tentang' },
    { href: '#keunggulan', label: 'Keunggulan' },
    { href: '#cara-kerja', label: 'Cara Kerja' },
    { href: '#darurat', label: 'Layanan Darurat' },
];

export function Footer() {
    return (
        <footer className="relative isolate overflow-hidden bg-sg-950 text-white">
            <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pt-16 pb-10 md:grid-cols-12 lg:px-8">
                <div className="md:col-span-6">
                    <Logo tone="light" />
                    <p className="mt-6 max-w-sm text-sm leading-7 text-sg-soft">
                        Membantu masyarakat menyampaikan informasi kejadian melalui sistem pelaporan yang lebih mudah dan terstruktur.
                    </p>
                    <div className="mt-8">
                        <LaporButton tone="mint" />
                    </div>
                </div>

                <nav aria-label="Navigasi footer" className="md:col-span-3">
                    <h2 className="font-data text-[11px] tracking-[0.2em] text-sg-mint uppercase">Navigasi</h2>
                    <ul className="mt-5 space-y-3 text-sm text-sg-soft">
                        {nav.map((n) => (
                            <li key={n.href}>
                                <a href={n.href} className="transition-colors hover:text-white">{n.label}</a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="md:col-span-3">
                    <h2 className="font-data text-[11px] tracking-[0.2em] text-sg-mint uppercase">Layanan</h2>
                    <ul className="mt-5 space-y-3 text-sm text-sg-soft">
                        <li><Link href="/lapor" className="transition-colors hover:text-white">Mulai Lapor</Link></li>
                        <li><Link href="/login" className="transition-colors hover:text-white">Masuk Admin</Link></li>
                        <li><a href="tel:112" className="transition-colors hover:text-white">Darurat: 112</a></li>
                    </ul>
                </div>
            </div>

            <div aria-hidden="true" className="pointer-events-none relative -mb-[4.5vw] select-none">
                <p className="font-display text-center text-[26vw] leading-none font-bold tracking-[-0.05em] text-sg-mint/[0.045] lg:text-[19rem]">
                    SIRINE
                </p>
            </div>

            <div className="relative border-t border-white/10 bg-sg-950">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-5 text-xs text-sg-soft/80 sm:flex-row lg:px-8">
                    <p>© {new Date().getFullYear()} SIRINE. All rights reserved.</p>
                    <p>SIRINE bukan pengganti layanan darurat resmi.</p>
                </div>
            </div>
        </footer>
    );
}
