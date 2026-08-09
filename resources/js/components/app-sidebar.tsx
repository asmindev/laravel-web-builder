import { FolderOpen, GalleryVerticalEnd, LayoutDashboard, Settings, Users, CreditCard } from 'lucide-react';
import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { PageProps } from '@/types';
import { Project } from '@/types/project';
import { Link, usePage } from '@inertiajs/react';

import { Can } from '@/components/can';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, recent_projects, projects, app_settings } = usePage<PageProps & { auth?: any; recent_projects?: Project[]; projects?: Project[]; app_settings?: { app_name: string; app_version?: string; admin_whatsapp: string; logo_url?: string } }>().props;
    const userRecentProjects = recent_projects && recent_projects.length > 0 ? recent_projects : (projects || []);
    const appName = app_settings?.app_name || 'Web Builder';
    const appVersion = app_settings?.app_version || 'V2';
    const logoUrl = app_settings?.logo_url || '/images/logo.webp';

    const navMain = [
        {
            title: 'Dashboard',
            url: route('dashboard'),
            icon: LayoutDashboard,
        },
        {
            title: 'Projects',
            url: route('projects.index'),
            icon: FolderOpen,
        },
    ];

    return (
        <Sidebar {...props} collapsible="icon">
            <SidebarHeader className="py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild tooltip={appName} className="h-auto py-2 hover:bg-transparent focus-visible:bg-transparent">
                            <Link href={route('dashboard')} className="flex flex-col items-center justify-center text-center w-full gap-2.5 group-data-[collapsible=icon]:py-1">
                                <img
                                    src={logoUrl}
                                    alt={`${appName} Logo`}
                                    className="h-20 w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-105 group-data-[collapsible=icon]:h-8"
                                />
                                <div className="flex flex-col items-center leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="font-bold text-base tracking-tight text-sidebar-foreground">{appName}</span>
                                    <span className="text-xs font-medium text-muted-foreground">{appVersion}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <Link href={item.url} className="font-medium">
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                <Can role="admin">
                    <SidebarGroup>
                        <SidebarGroupLabel>Administrator</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Kelola User">
                                    <Link href={route('admin.users.index')} className="font-medium">
                                        <Users className="size-4" />
                                        <span>Kelola User</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Kelola Paket">
                                    <Link href={route('admin.plans.index')} className="font-medium">
                                        <CreditCard className="size-4" />
                                        <span>Kelola Paket</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Pengaturan Sistem">
                                    <Link href={route('admin.settings.index')} className="font-medium">
                                        <Settings className="size-4" />
                                        <span>Pengaturan Sistem</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </Can>
                {userRecentProjects && userRecentProjects.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
                        <SidebarMenu>
                            {userRecentProjects.slice(0, 5).map((p) => (
                                <SidebarMenuItem key={p.id}>
                                    <SidebarMenuButton asChild size="sm" tooltip={p.name}>
                                        <Link href={route('projects.show', p.slug)} className="group/item">
                                            <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
                                            <span className="flex-1 truncate">{p.name}</span>
                                            <span className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                                p.published
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {p.published ? 'Live' : 'Draft'}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
