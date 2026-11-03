import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { About } from '@/components/sigap/about';
import { ChatPreview } from '@/components/sigap/chat-preview';
import { Emergency } from '@/components/sigap/emergency';
import { Features } from '@/components/sigap/features';
import { Footer } from '@/components/sigap/footer';
import { Hero } from '@/components/sigap/hero';
import { HowItWorks } from '@/components/sigap/how-it-works';
import { Navbar } from '@/components/sigap/navbar';

export default function Welcome() {
    // Scroll halus untuk tautan anchor, hanya selama halaman ini aktif
    useEffect(() => {
        const root = document.documentElement;
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) return;
        root.style.scrollBehavior = 'smooth';
        return () => {
            root.style.scrollBehavior = '';
        };
    }, []);

    return (
        <>
            <Head title="SIGAP | Pelaporan Kejadian">
                <meta
                    name="description"
                    content="SIGAP (Smart Incident Reporting) membantu masyarakat melaporkan kejadian lewat percakapan dengan asisten AI, tanpa registrasi akun."
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=JetBrains+Mono:wght@400;500&display=swap"
                />
            </Head>

            <div className="min-h-screen bg-white text-sg-900 selection:bg-sg-mint selection:text-sg-900">
                <Navbar />
                <main>
                    <Hero />
                    <About />
                    <Features />
                    <HowItWorks />
                    <ChatPreview />
                    <Emergency />
                </main>
                <Footer />
            </div>
        </>
    );
}
