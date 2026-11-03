import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    History,
    LayoutDashboard,
    Map,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as activity } from '@/routes/activity';
import { edit as editProfile } from '@/routes/profile';
import { index as reports, map as reportMap } from '@/routes/reports';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Laporan',
        href: reports(),
        icon: ClipboardList,
    },
    {
        title: 'Peta Laporan',
        href: reportMap(),
        icon: Map,
    },
];

const secondaryNavItems: NavItem[] = [
    {
        title: 'Riwayat Aktivitas',
        href: activity(),
        icon: History,
    },
];

const accountNavItems: NavItem[] = [
    {
        title: 'Pengaturan',
        href: editProfile(),
        icon: Settings,
    },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Menu utama" />
                <NavMain items={secondaryNavItems} label="Lainnya" />
                <NavMain items={accountNavItems} label="Akun" />
            </SidebarContent>

            <SidebarFooter>
                <SidebarSeparator className="mx-0" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
