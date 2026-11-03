import { Ambulance, Flame, LifeBuoy, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Reveal } from './reveal';
import { Eyebrow } from './section-heading';

const services = [
    { number: '110', name: 'Polisi', icon: ShieldCheck },
    { number: '113', name: 'Pemadam Kebakaran', icon: Flame },
    { number: '118', name: 'Ambulans', note: 'atau 119', icon: Ambulance },
    { number: '115', name: 'SAR (Basarnas)', icon: LifeBuoy },
];

export function Emergency() {
    return (
        <section
            id="darurat"
            aria-labelledby="darurat-title"
            className="scroll-mt-16 bg-sg-paper py-24 lg:py-32"
        >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <div className="grid overflow-hidden rounded-[28px] border border-sg-line bg-white lg:grid-cols-12">
                        <div className="p-7 sm:p-10 lg:col-span-5 lg:p-12">
                            <Eyebrow>Layanan darurat</Eyebrow>
                            <h2
                                id="darurat-title"
                                className="font-display mt-5 text-[clamp(1.7rem,3.2vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-sg-900"
                            >
                                Dalam keadaan darurat, hubungi layanan resmi lebih dulu.
                            </h2>
                            <p className="mt-5 text-[15px] leading-7 text-sg-text">
                                SIRINE merupakan sarana pendukung penyampaian dan pencatatan informasi kejadian.
                                Apabila terjadi keadaan yang membutuhkan pertolongan segera, hubungi layanan darurat resmi di wilayah Anda.
                            </p>
                            <p className="mt-7 flex items-start gap-3 rounded-2xl bg-sg-mint-50 p-4 text-sm leading-6 font-medium text-sg-800 ring-1 ring-sg-line">
                                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-sg-600" />
                                SIRINE bukan pengganti layanan darurat resmi.
                            </p>
                        </div>

                        <div className="relative isolate flex flex-col justify-center overflow-hidden bg-sg-900 p-7 sm:p-10 lg:col-span-7 lg:p-12">
                            <div aria-hidden="true" className="sg-dots absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(circle_at_100%_0%,black,transparent_60%)]" />

                            <a
                                href="tel:112"
                                className="group flex items-center justify-between gap-4 rounded-3xl bg-sg-mint p-6 text-sg-900 transition hover:bg-sg-mint-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:p-7"
                            >
                                <div>
                                    <p className="font-data text-[10px] tracking-[0.2em] uppercase">
                                        Panggilan darurat
                                    </p>
                                    <p className="font-display mt-1 text-6xl leading-none font-semibold tracking-tight sm:text-7xl">
                                        112
                                    </p>
                                </div>
                                <span className="flex size-14 items-center justify-center rounded-full bg-sg-900 text-sg-mint transition-transform group-hover:scale-105">
                                    <Phone className="size-6" />
                                </span>
                            </a>

                            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                {services.map((s) => (
                                    <li key={s.number}>
                                        <a
                                            href={`tel:${s.number}`}
                                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-sg-mint/40 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-sg-mint focus-visible:outline-none"
                                        >
                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sg-mint/10 text-sg-mint">
                                                <s.icon className="size-5" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="font-display block text-2xl leading-none font-semibold text-white">
                                                    {s.number}
                                                    {s.note && (
                                                        <span className="font-data ml-2 text-[11px] font-normal text-sg-soft">
                                                            {s.note}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="mt-1.5 block text-[13px] text-sg-soft">
                                                    {s.name}
                                                </span>
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-5 text-xs leading-5 text-sg-soft/80">
                                Ketersediaan layanan dapat berbeda di tiap wilayah.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
