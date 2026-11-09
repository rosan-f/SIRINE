import { Link, usePage } from '@inertiajs/react';
import { Check, LockKeyhole } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const year = new Date().getFullYear();

    return (
        <main className="relative min-h-svh overflow-hidden bg-white text-[#26332a] lg:grid lg:grid-cols-2">
            <svg
                aria-hidden="true"
                viewBox="0 0 560 800"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-y-0 left-0 hidden h-full lg:block"
                style={{ width: '56%' }}
            >
                <path d="M0 0H420C505 0 505 800 420 800H0Z" fill="#0a2b23" />
            </svg>

            <aside className="relative z-10 hidden min-h-svh flex-col justify-between overflow-hidden px-12 py-10 text-white lg:flex xl:px-16 xl:py-12">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(223,246,228,0.24)_0.8px,transparent_0.8px)] [background-size:22px_22px] [mask-image:linear-gradient(135deg,black,transparent_80%)]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-36 size-[410px] rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -top-8 -right-20 size-[280px] rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute right-12 bottom-[18%] size-28 rounded-full bg-[#a7e9c7]/10 blur-2xl" />

                <Link
                    href={home()}
                    className="relative flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                    <span className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[#d8f1df]">
                        <AppLogoIcon className="size-5" />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold tracking-tight">{name}</span>
                        <span className="mt-0.5 block text-[10px] tracking-[0.14em] text-white/65 uppercase">Portal pengelola</span>
                    </span>
                </Link>

                <div className="relative my-14 max-w-[360px] xl:my-0">
                    <p className="mb-5 flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-[#c9efd5] uppercase">
                        <span className="size-1.5 rounded-full bg-[#a7e9c7]" />
                        Respons insiden yang lebih terarah
                    </p>
                    <h2 className="text-[clamp(2.25rem,3.5vw,3.4rem)] leading-[1.05] font-semibold tracking-[-0.045em] text-balance">
                        Kelola laporan dengan lebih mudah.
                    </h2>
                    <p className="mt-5 max-w-[330px] text-sm leading-6 text-white/75">
                        Satu ruang kerja untuk meninjau informasi kejadian dan membantu tim menentukan langkah berikutnya.
                    </p>

                    <div className="mt-8 flex flex-col gap-3">
                        {['Laporan tersusun rapi', 'Informasi siap ditinjau'].map((item) => (
                            <div key={item} className="flex items-center gap-2.5 text-xs text-white/80">
                                <span className="flex size-[18px] items-center justify-center rounded-full bg-white/15 text-[#d8f1df]">
                                    <Check className="size-3" strokeWidth={2.5} />
                                </span>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-[11px] text-white/65">
                    Pelengkap layanan darurat 119.
                </p>
            </aside>

            <header className="relative isolate overflow-hidden bg-sg-900 px-6 pt-6 pb-8 text-white lg:hidden">
                <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 -z-10 size-64 rounded-full border border-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -top-14 -right-6 -z-10 size-40 rounded-full border border-white/10" />
                <Link
                    href={home()}
                    className="flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[#d8f1df]">
                        <AppLogoIcon className="size-[18px]" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight">{name}</span>
                </Link>
                <p className="mt-6 max-w-[25ch] text-[22px] leading-tight font-semibold tracking-tight">
                    Respons yang lebih terarah.
                </p>
            </header>

            <section className="relative z-10 flex min-h-[calc(100svh-174px)] items-center justify-center px-6 py-10 sm:px-10 lg:col-start-2 lg:min-h-svh lg:px-12 lg:py-14 xl:px-20">
                <div className="w-full max-w-sm" style={{ width: '100%', maxWidth: '25rem' }}>
                    <div className="mb-7 flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-sg-700 uppercase">
                        <LockKeyhole className="size-3.5" />
                        Akses aman
                    </div>
                    <div className="mb-7">
                        <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.045em] text-[#202820] sm:text-[32px]">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2.5 text-sm leading-6 text-[#657269]">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    <p className="mt-8 text-center text-[11px] text-[#78847b] lg:text-left">
                        © {year} {name} <span className="px-1.5 text-[#a7b0a9]">·</span> Pelengkap layanan darurat 119
                    </p>
                </div>
            </section>
        </main>
    );
}
