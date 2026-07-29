import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import { Layout, Terminal } from 'lucide-react';

const templates = [
    { id: 'landing', icon: Layout, name: 'Landing Page', description: 'A simple landing page layout' },
    { id: 'node-backend', icon: Terminal, name: 'Node.js Backend', description: 'Express API with routes' },
];

export default function CreateProject() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        template: 'landing',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Create Project</h2>}>
            <Head title="Create Project" />

            <div className="mx-auto max-w-lg">
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Create Project</CardTitle>
                            <CardDescription>Name your project and pick a template.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="My Awesome Site"
                                    required
                                    autoFocus
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What is this project about?"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Template</Label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            type="button"
                                            onClick={() => setData('template', tpl.id)}
                                            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                                                data.template === tpl.id ? 'border-primary ring-1 ring-primary' : ''
                                            }`}
                                        >
                                            <div className={`mt-0.5 rounded-md border p-1.5 ${data.template === tpl.id ? 'bg-primary text-primary-foreground' : ''}`}>
                                                <tpl.icon className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{tpl.name}</div>
                                                <div className="text-xs text-muted-foreground">{tpl.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button type="submit" className="min-w-32" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Project'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('projects.index')}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
