import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, FolderOpen, Loader2, MoreHorizontal, Plus, Search, ShieldCheck, Trash2, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    plan: 'starter' | 'basic' | 'pro' | 'business';
    plan_name: string;
    project_limit: number | string;
    projects_count: number;
    roles: string[];
    created_at: string;
}

interface PlanOption {
    id: number;
    name: string;
    slug: string;
    project_limit: number;
}

interface IndexProps {
    users: {
        data: UserItem[];
        links: any[];
        total: number;
    };
    filters: {
        search: string;
        role: string;
        plan: string;
    };
    roles: string[];
    plans: (string | PlanOption)[];
}

export default function UserIndex({ users, filters, roles, plans }: IndexProps) {
    const planOptions: PlanOption[] = Array.isArray(plans)
        ? plans.map((p) => (typeof p === 'string' ? { id: 0, name: p.toUpperCase(), slug: p, project_limit: 0 } : p))
        : [];
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [planFilter, setPlanFilter] = useState(filters.plan || 'all');

    // Create Modal & Form state via useForm
    const [showCreate, setShowCreate] = useState(false);
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan: 'starter',
    });

    // Edit Modal & Form state via useForm
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan: 'starter',
    });

    // Delete Modal state
    const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearchFilter = (newSearch = search, newRole = roleFilter, newPlan = planFilter) => {
        router.get(route('admin.users.index'), { search: newSearch, role: newRole, plan: newPlan }, { preserveState: true, replace: true });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] || 'user',
            plan: user.plan || 'starter',
        });
        editForm.clearErrors();
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingUser) return;
        setDeleting(true);

        router.delete(route('admin.users.destroy', deletingUser.id), {
            onSuccess: () => setDeletingUser(null),
            onFinish: () => setDeleting(false),
        });
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'starter':
                return (
                    <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300">
                        Starter
                    </Badge>
                );
            case 'basic':
                return (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Basic
                    </Badge>
                );
            case 'pro':
                return <Badge className="bg-primary font-bold text-primary-foreground">Pro</Badge>;
            case 'business':
                return <Badge className="bg-[#ff8a5c] font-bold text-white">Business</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Kelola User &amp; Paket Access</h2>}>
            <Head title="Admin — Kelola User" />

            <div className="space-y-6">
                {/* Header Stats Bar */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengguna</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.total}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Terdaftar dalam platform</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Access</CardTitle>
                            <ShieldCheck className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.data.filter((u) => u.roles.includes('admin')).length}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Administrator sistem</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Proyek</CardTitle>
                            <FolderOpen className="size-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.data.reduce((acc, u) => acc + u.projects_count, 0)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Proyek aktif di halaman ini</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleSearchFilter(e.target.value, roleFilter, planFilter);
                                }}
                                placeholder="Cari nama atau email..."
                                className="pl-8"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                handleSearchFilter(search, e.target.value, planFilter);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="all">Semua Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => {
                                setPlanFilter(e.target.value);
                                handleSearchFilter(search, roleFilter, e.target.value);
                            }}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:outline-none"
                        >
                            <option value="all">Semua Paket</option>
                            {planOptions.map((p) => (
                                <option key={p.slug} value={p.slug}>
                                    {p.name} {p.project_limit > 0 ? `(Max ${p.project_limit})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button onClick={() => setShowCreate(true)} className="gap-1.5">
                        <Plus className="size-4" /> Tambah User
                    </Button>
                </div>

                {/* Users Table */}
                <Card>
                    <CardContent className="overflow-x-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
                                <tr>
                                    <th className="p-4">User Info</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Paket / Class</th>
                                    <th className="p-4">Proyek / Upload</th>
                                    <th className="p-4">Terdaftar</th>
                                    <th className="p-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            Tidak ada user yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="transition-colors hover:bg-muted/30">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {u.roles.includes('admin') ? (
                                                    <Badge className="gap-1 bg-emerald-600 text-white">
                                                        <ShieldCheck className="size-3" /> Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">User</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">{getPlanBadge(u.plan)}</td>
                                            <td className="p-4">
                                                <Link
                                                    href={route('admin.users.projects', u.id)}
                                                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold transition-colors hover:text-primary hover:underline"
                                                >
                                                    <FolderOpen className="size-3.5 text-primary" />
                                                    {u.projects_count} / {u.project_limit} Proyek
                                                </Link>
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground">{u.created_at}</td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 p-0">
                                                            <MoreHorizontal className="size-4" />
                                                            <span className="sr-only">Buka menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={route('admin.users.projects', u.id)}
                                                                className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                                                            >
                                                                <FolderOpen className="size-4 text-primary" /> Lihat Proyek ({u.projects_count})
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => openEditModal(u)}
                                                            className="flex cursor-pointer items-center gap-2 text-xs font-medium"
                                                        >
                                                            <Edit className="size-4 text-indigo-500" /> Edit User & Paket
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingUser(u)}
                                                            className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-red-600 focus:text-red-600 dark:text-red-400"
                                                        >
                                                            <Trash2 className="size-4 text-red-500" /> Hapus User
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Create User Modal */}
                <Dialog open={showCreate} onOpenChange={(open) => {
                    setShowCreate(open);
                    if (!open) createForm.reset();
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah User Baru</DialogTitle>
                            <DialogDescription>Buat akun user baru dan tentukan Role serta Paketnya.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                            {createForm.hasErrors && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>Terdapat kesalahan pengisian form. Silakan periksa kembali data Anda.</span>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="c-name">Nama Lengkap</Label>
                                <Input
                                    id="c-name"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                    className={createForm.errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {createForm.errors.name && <p className="text-xs font-medium text-red-500">{createForm.errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-email">Email</Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                    className={createForm.errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {createForm.errors.email && <p className="text-xs font-medium text-red-500">{createForm.errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-password">Password</Label>
                                <Input
                                    id="c-password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    required
                                    className={createForm.errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {createForm.errors.password && <p className="text-xs font-medium text-red-500">{createForm.errors.password}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Role Akses</Label>
                                    <select
                                        value={createForm.data.role}
                                        onChange={(e) => createForm.setData('role', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {createForm.errors.role && <p className="text-xs font-medium text-red-500">{createForm.errors.role}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Paket (Upload Limit)</Label>
                                    <select
                                        value={createForm.data.plan}
                                        onChange={(e) => createForm.setData('plan', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {planOptions.map((p) => (
                                            <option key={p.slug} value={p.slug}>
                                                {p.name} {p.project_limit > 0 ? `(Max ${p.project_limit})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {createForm.errors.plan && <p className="text-xs font-medium text-red-500">{createForm.errors.plan}</p>}
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Simpan User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User & Role/Plan Modal */}
                <Dialog open={!!editingUser} onOpenChange={(open) => {
                    if (!open) {
                        setEditingUser(null);
                        editForm.reset();
                    }
                }}>
                    <DialogContent className="min-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">Edit Role &amp; Paket User</DialogTitle>
                            <DialogDescription>Ubah role hak akses dan kelas paket untuk {editingUser?.name}.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            {editForm.hasErrors && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>Terdapat kesalahan pengisian form. Silakan periksa kembali data Anda.</span>
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="e-name">Nama Lengkap</Label>
                                <Input
                                    id="e-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                    className={editForm.errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {editForm.errors.name && <p className="text-xs font-medium text-red-500">{editForm.errors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-email">Email</Label>
                                <Input
                                    id="e-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                    className={editForm.errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {editForm.errors.email && <p className="text-xs font-medium text-red-500">{editForm.errors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-password">Password Baru (Opsional)</Label>
                                <Input
                                    id="e-password"
                                    type="password"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                    className={editForm.errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {editForm.errors.password && <p className="text-xs font-medium text-red-500">{editForm.errors.password}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Role Hak Akses</Label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {editForm.errors.role && <p className="text-xs font-medium text-red-500">{editForm.errors.role}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Paket (Upload Limit)</Label>
                                    <select
                                        value={editForm.data.plan}
                                        onChange={(e) => editForm.setData('plan', e.target.value)}
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {planOptions.map((p) => (
                                            <option key={p.slug} value={p.slug}>
                                                {p.name} {p.project_limit > 0 ? `(Max ${p.project_limit})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {editForm.errors.plan && <p className="text-xs font-medium text-red-500">{editForm.errors.plan}</p>}
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Update User &amp; Paket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete User Modal */}
                <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus User</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser?.name}</strong> ({deletingUser?.email})? Tindakan ini
                                tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button variant="outline" onClick={() => setDeletingUser(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleting}>
                                {deleting ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Hapus User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
