import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { LaporButton } from './lapor-button';
import { Logo } from './logo';

const links = [
    { href: '#tentang', label: 'Tentang' },
    { href: '#keunggulan', label: 'Keunggulan' },
    { href: '#cara-kerja', label: 'Cara Kerja' },
    { href: '#percakapan', label: 'Contoh Chat' },
    { href: '#darurat', label: 'Layanan Darurat' },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Tema terang dipakai setelah halaman digulir
    const light = scrolled;

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
                light
                    ? 'border-b border-sg-line bg-white/85 backdrop-blur-xl'
                    : 'border-b border-transparent',
            )}
        >
            <nav
                aria-label="Navigasi utama"
                className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8"
            >
                <a
                    href="#beranda"
                    aria-label="SIRINE — ke awal halaman"
                    className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sg-mint"
                >
                    <Logo tone={light ? 'dark' : 'light'} />
                </a>

                <ul className="hidden items-center gap-1 lg:flex">
                    {links.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                    light
                                        ? 'text-sg-text hover:bg-sg-mint-50 hover:text-sg-900'
                                        : 'text-white/75 hover:bg-white/10 hover:text-white',
                                )}
                            >
                                {l.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className={cn(
                            'hidden rounded-full px-4 py-2 text-sm font-medium transition-colors sm:inline-flex',
                            light
                                ? 'text-sg-700 hover:bg-sg-mint-50'
                                : 'text-white/75 hover:text-white',
                        )}
                    >
                        Masuk Admin
                    </Link>
                    <LaporButton tone={light ? 'dark' : 'mint'} />
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="menu-mobile"
                        aria-label={open ? 'Tutup menu' : 'Buka menu'}
                        className={cn(
                            'ml-1 flex size-10 items-center justify-center rounded-full transition-colors lg:hidden',
                            light
                                ? 'text-sg-900 hover:bg-sg-mint-50'
                                : 'text-white hover:bg-white/10',
                        )}
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </nav>

            <div
                id="menu-mobile"
                hidden={!open}
                className={cn(
                    'border-t lg:hidden',
                    light
                        ? 'border-sg-line bg-white'
                        : 'border-white/10 bg-sg-900',
                )}
            >
                <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3">
                    {links.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'block rounded-xl px-3 py-3 text-[15px] font-medium',
                                    light ? 'text-sg-800' : 'text-white/85',
                                )}
                            >
                                {l.label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <Link
                            href="/login"
                            className={cn(
                                'block rounded-xl px-3 py-3 text-[15px] font-medium',
                                light ? 'text-sg-700' : 'text-sg-mint',
                            )}
                        >
                            Masuk Admin
                        </Link>
                    </li>
                </ul>
            </div>
        </header>
    );
}
