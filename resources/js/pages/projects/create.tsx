import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';

const templates = [
    { id: 'blank', name: 'Blank', description: 'Start from scratch' },
    { id: 'landing', name: 'Landing Page', description: 'A simple landing page layout' },
    { id: 'blog', name: 'Blog', description: 'Blog post template' },
    { id: 'portfolio', name: 'Portfolio', description: 'Portfolio showcase' },
    { id: 'node-backend', name: 'Node.js Backend', description: 'Express API with routes' },
];

export default function CreateProject() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        template: 'blank',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Create Project</h2>}>
            <Head title="Create Project" />

            <div className="mx-auto max-w-2xl">
                <form onSubmit={submit} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                            <CardDescription>Give your project a name and description.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="What is this project about?"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Template</CardTitle>
                            <CardDescription>Choose a starting template.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => setData('template', tpl.id)}
                                        className={`rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                                            data.template === tpl.id ? 'border-primary ring-1 ring-primary' : ''
                                        }`}
                                    >
                                        <div className="font-medium">{tpl.name}</div>
                                        <div className="text-sm text-muted-foreground">{tpl.description}</div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
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
