import { FolderOpen, GalleryVerticalEnd, LayoutDashboard, Settings, Users } from 'lucide-react';
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { auth, recent_projects, projects } = usePage<PageProps & { auth?: any; recent_projects?: Project[]; projects?: Project[] }>().props;
    const userRecentProjects = recent_projects && recent_projects.length > 0 ? recent_projects : (projects || []);

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
        {
            title: 'Settings',
            url: '#',
            icon: Settings,
        },
    ];

    return (
        <Sidebar {...props} collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <GalleryVerticalEnd className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Web Builder</span>
                                    <span className="">v1.0.0</span>
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
                {auth?.user?.is_admin && (
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
                        </SidebarMenu>
                    </SidebarGroup>
                )}
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
