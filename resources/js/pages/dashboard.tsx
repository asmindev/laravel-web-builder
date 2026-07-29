import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, usePage } from '@inertiajs/react';
import { FolderOpen, Plus, Globe, FileCode, Image } from 'lucide-react';

interface DashboardProps {
    stats?: {
        total_projects: number;
        published: number;
        total_files: number;
        total_assets: number;
    };
}

export default function Dashboard() {
    const { stats } = usePage<{ stats?: DashboardProps['stats'] }>().props;
    const counts = stats || { total_projects: 0, published: 0, total_files: 0, total_assets: 0 };

    const cards = [
        { label: 'Total Projects', value: counts.total_projects, icon: FolderOpen },
        { label: 'Published', value: counts.published, icon: Globe },
        { label: 'Files', value: counts.total_files, icon: FileCode },
        { label: 'Assets', value: counts.total_assets, icon: Image },
    ];

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Dashboard</h2>}>
            <Head title="Dashboard" />

            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                            <card.icon className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6 flex gap-4">
                <Button asChild>
                    <Link href={route('projects.create')}>
                        <Plus /> New Project
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('projects.index')}>View All Projects</Link>
                </Button>
            </div>
        </AdminLayout>
    );
}
