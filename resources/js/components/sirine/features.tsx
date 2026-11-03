import { ArrowRight, Bot, ClipboardCheck, ListChecks, MessageCircle, UserRoundCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';
import { SectionHeading } from './section-heading';

const tileBase = 'relative overflow-hidden rounded-[28px] p-7 sm:p-8';

function IconBox({
    children,
    dark,
}: {
    children: ReactNode;
    dark?: boolean;
}) {
    return (
        <span
            className={cn(
                'flex size-11 items-center justify-center rounded-2xl',
                dark ? 'bg-sg-mint text-sg-900' : 'bg-sg-900 text-sg-mint',
            )}
        >
            {children}
        </span>
    );
}

export function Features() {
    return (
        <section
            id="keunggulan"
            aria-labelledby="keunggulan-title"
            className="scroll-mt-16 bg-sg-paper py-24 lg:py-32"
        >
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionHeading
                        id="keunggulan-title"
                        eyebrow="Keunggulan & manfaat"
                        title="Pelaporan yang lebih terarah, tanpa proses yang rumit."
                        className="max-w-2xl"
                    />
                </Reveal>

                <div className="mt-14 grid gap-4 md:grid-cols-12">
                    {/* AI */}
                    <Reveal className="md:col-span-7">
                        <article className={cn(tileBase, 'flex h-full min-h-[320px] flex-col bg-sg-900 text-white')}>
                            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-24 size-[360px]">
                                {[100, 72, 44].map((p) => (
                                    <span key={p} style={{ width: `${p}%`, height: `${p}%` }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sg-mint/20" />
                                ))}
                            </div>
                            <IconBox dark>
                                <Bot className="size-5" />
                            </IconBox>
                            <h3 className="font-display mt-6 text-[1.7rem] leading-tight font-semibold tracking-tight">
                                Asisten berbasis AI
                            </h3>
                            <p className="mt-3 max-w-md text-[15px] leading-7 text-sg-soft">
                                Asisten dirancang untuk membantu memahami informasi dan mengumpulkan detail kejadian.
                            </p>
                            <ol className="font-data relative mt-auto flex flex-wrap pt-9 items-center gap-2 text-[11px] tracking-wide text-sg-mint">
                                {['Memahami cerita', 'Menanyakan detail', 'Menyusun laporan'].map((t, i) => (
                                    <li key={t} className="flex items-center gap-2">
                                        <span className="rounded-full border border-sg-mint/30 bg-sg-mint/10 px-3 py-1.5">{t}</span>
                                        {i < 2 && <ArrowRight className="size-3.5 text-sg-mint/50" />}
                                    </li>
                                ))}
                            </ol>
                        </article>
                    </Reveal>

                    {/* Mudah */}
                    <Reveal className="md:col-span-5" delay={100}>
                        <article className={cn(tileBase, 'flex h-full min-h-[320px] flex-col bg-sg-mint-100')}>
                            <IconBox>
                                <MessageCircle className="size-5" />
                            </IconBox>
                            <h3 className="font-display mt-6 text-[1.7rem] leading-tight font-semibold tracking-tight text-sg-900">
                                Pelaporan lebih mudah
                            </h3>
                            <p className="mt-3 text-[15px] leading-7 text-sg-text">
                                Sampaikan informasi kejadian melalui percakapan yang sederhana dan mudah dipahami.
                            </p>
                            <div aria-hidden="true" className="mt-auto space-y-2 pt-8">
                                <div className="w-3/4 rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[13px] text-sg-800">Ada kejadian apa?</div>
                                <div className="ml-auto w-2/3 rounded-2xl rounded-br-md bg-sg-800 px-4 py-2.5 text-[13px] text-white">Ada pohon tumbang.</div>
                            </div>
                        </article>
                    </Reveal>

                    {/* Terstruktur */}
                    <Reveal className="md:col-span-4">
                        <article className={cn(tileBase, 'h-full border border-sg-line bg-white')}>
                            <IconBox>
                                <ListChecks className="size-5" />
                            </IconBox>
                            <h3 className="font-display mt-6 text-xl font-semibold tracking-tight text-sg-900">
                                Informasi lebih terstruktur
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-sg-text">
                                Informasi laporan disusun agar lebih mudah diperiksa dan dikelola oleh petugas.
                            </p>
                        </article>
                    </Reveal>

                    {/* Tanpa akun */}
                    <Reveal className="md:col-span-4" delay={100}>
                        <article className={cn(tileBase, 'h-full border border-sg-line bg-white')}>
                            <IconBox>
                                <UserRoundCheck className="size-5" />
                            </IconBox>
                            <h3 className="font-display mt-6 text-xl font-semibold tracking-tight text-sg-900">
                                Tanpa registrasi akun
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-sg-text">
                                Buka melalui web dan langsung mulai bercerita, tanpa perlu membuat akun terlebih dahulu.
                            </p>
                        </article>
                    </Reveal>

                    {/* Ditinjau */}
                    <Reveal className="md:col-span-4" delay={200}>
                        <article className={cn(tileBase, 'h-full border border-sg-line bg-white')}>
                            <IconBox>
                                <ClipboardCheck className="size-5" />
                            </IconBox>
                            <h3 className="font-display mt-6 text-xl font-semibold tracking-tight text-sg-900">
                                Dapat dipantau &amp; ditinjau
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-sg-text">
                                Setiap laporan tersimpan agar dapat dipantau dan ditinjau oleh admin.
                            </p>
                        </article>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
