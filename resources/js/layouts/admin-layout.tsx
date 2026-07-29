import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
    header?: React.ReactNode;
}

export default function AdminLayout({ children, header }: AdminLayoutProps) {
    const { props, component } = usePage<PageProps>();

    useEffect(() => {
        const flash = props.flash;

        if (flash.content) {
            toast[flash.type ?? 'message'](flash.content);
        }
    }, [props.flash]);
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {header !== null && (
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <span className="text-sm font-medium">
                            {component === 'projects/show' ? 'Editor' :
                             component === 'projects/index' ? 'Projects' :
                             component === 'projects/create' ? 'New Project' :
                             component === 'projects/preview' ? 'Preview' : 'Dashboard'}
                        </span>
                        {header && <div className="ml-auto">{header}</div>}
                    </header>
                )}
                <div className={`flex min-h-0 flex-1 flex-col gap-4 p-4 ${component === 'projects/show' ? 'overflow-hidden' : 'overflow-y-auto'}`}>{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}
