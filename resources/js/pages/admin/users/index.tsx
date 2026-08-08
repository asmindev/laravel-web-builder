import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Users, ShieldAlert, ShieldCheck, FolderOpen, Edit, Trash2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    plans: string[];
}

export default function UserIndex({ users, filters, roles, plans }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [planFilter, setPlanFilter] = useState(filters.plan || 'all');

    // Create Modal state
    const [showCreate, setShowCreate] = useState(false);
    const [createData, setCreateData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan: 'starter',
    });
    const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
    const [creating, setCreating] = useState(false);

    // Edit Modal state
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        plan: 'starter',
    });
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});
    const [updating, setUpdating] = useState(false);

    // Delete Modal state
    const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearchFilter = (newSearch = search, newRole = roleFilter, newPlan = planFilter) => {
        router.get(
            route('admin.users.index'),
            { search: newSearch, role: newRole, plan: newPlan },
            { preserveState: true, replace: true }
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateErrors({});

        router.post(route('admin.users.store'), createData, {
            onSuccess: () => {
                setShowCreate(false);
                setCreateData({ name: '', email: '', password: '', role: 'user', plan: 'starter' });
            },
            onError: (errs) => setCreateErrors(errs),
            onFinish: () => setCreating(false),
        });
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.roles[0] || 'user',
            plan: user.plan || 'starter',
        });
        setEditErrors({});
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setUpdating(true);
        setEditErrors({});

        router.put(route('admin.users.update', editingUser.id), editData, {
            onSuccess: () => setEditingUser(null),
            onError: (errs) => setEditErrors(errs),
            onFinish: () => setUpdating(false),
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
                return <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300">Starter (2 Proyek)</Badge>;
            case 'basic':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Basic (5 Proyek)</Badge>;
            case 'pro':
                return <Badge className="bg-[#2cb1bc] text-slate-900 font-bold">Pro (10 Proyek)</Badge>;
            case 'business':
                return <Badge className="bg-[#ff8a5c] text-white font-bold">Business (15 Proyek)</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    return (
        <AdminLayout header={<h2 className="text-xl font-semibold leading-tight">Kelola User &amp; Paket Access</h2>}>
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
                            <p className="text-xs text-muted-foreground mt-1">Terdaftar dalam platform</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Admin Access</CardTitle>
                            <ShieldCheck className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.data.filter(u => u.roles.includes('admin')).length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Administrator sistem</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Proyek</CardTitle>
                            <FolderOpen className="size-4 text-[#2cb1bc]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.data.reduce((acc, u) => acc + u.projects_count, 0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">Proyek aktif di halaman ini</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                            <option value="all">Semua Paket</option>
                            <option value="starter">Starter (Max 2)</option>
                            <option value="basic">Basic (Max 5)</option>
                            <option value="pro">Pro (Max 10)</option>
                            <option value="business">Business (Max 15)</option>
                        </select>
                    </div>

                    <Button onClick={() => setShowCreate(true)} className="gap-1.5 bg-[#2cb1bc] hover:bg-[#239099] text-slate-900 font-bold">
                        <Plus className="size-4" /> Tambah User
                    </Button>
                </div>

                {/* Users Table */}
                <Card>
                    <CardContent className="p-0 overflow-x-auto">
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
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                                                <div className="text-xs text-muted-foreground">{u.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {u.roles.includes('admin') ? (
                                                    <Badge className="bg-emerald-600 text-white gap-1"><ShieldCheck className="size-3" /> Admin</Badge>
                                                ) : (
                                                    <Badge variant="outline">User</Badge>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {getPlanBadge(u.plan)}
                                            </td>
                                            <td className="p-4">
                                                <Link
                                                    href={route('admin.users.projects', u.id)}
                                                    className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold hover:text-[#2cb1bc] hover:underline transition-colors"
                                                >
                                                    <FolderOpen className="size-3.5 text-[#2cb1bc]" />
                                                    {u.projects_count} / {u.project_limit} Proyek
                                                </Link>
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {u.created_at}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs text-[#2cb1bc] border-[#2cb1bc]/40 hover:bg-[#2cb1bc]/10">
                                                        <Link href={route('admin.users.projects', u.id)}>
                                                            <FolderOpen className="size-3.5" /> Lihat Proyek ({u.projects_count})
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openEditModal(u)} className="h-8 gap-1 text-xs">
                                                        <Edit className="size-3.5" /> Edit
                                                    </Button>
                                                    <Button variant="destructive" size="icon-xs" onClick={() => setDeletingUser(u)} title="Hapus User">
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Create User Modal */}
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah User Baru</DialogTitle>
                            <DialogDescription>Buat akun user baru dan tentukan Role serta Paketnya.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-name">Nama Lengkap</Label>
                                <Input
                                    id="c-name"
                                    value={createData.name}
                                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                />
                                {createErrors.name && <p className="text-xs text-red-500">{createErrors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-email">Email</Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    value={createData.email}
                                    onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                                    placeholder="user@example.com"
                                    required
                                />
                                {createErrors.email && <p className="text-xs text-red-500">{createErrors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="c-password">Password</Label>
                                <Input
                                    id="c-password"
                                    type="password"
                                    value={createData.password}
                                    onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                                    placeholder="Minimal 8 karakter"
                                    required
                                />
                                {createErrors.password && <p className="text-xs text-red-500">{createErrors.password}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Role Akses</Label>
                                    <select
                                        value={createData.role}
                                        onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Paket (Upload Limit)</Label>
                                    <select
                                        value={createData.plan}
                                        onChange={(e) => setCreateData({ ...createData, plan: e.target.value })}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="starter">Starter (Max 2)</option>
                                        <option value="basic">Basic (Max 5)</option>
                                        <option value="pro">Pro (Max 10)</option>
                                        <option value="business">Business (Max 15)</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={creating}>
                                    {creating ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Simpan User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User & Role/Plan Modal */}
                <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Role &amp; Paket User</DialogTitle>
                            <DialogDescription>Ubah role hak akses dan kelas paket untuk {editingUser?.name}.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="e-name">Nama Lengkap</Label>
                                <Input
                                    id="e-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    required
                                />
                                {editErrors.name && <p className="text-xs text-[#ff8a5c]">{editErrors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-email">Email</Label>
                                <Input
                                    id="e-email"
                                    type="email"
                                    value={editData.email}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    required
                                />
                                {editErrors.email && <p className="text-xs text-red-500">{editErrors.email}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="e-password">Password Baru (Opsional)</Label>
                                <Input
                                    id="e-password"
                                    type="password"
                                    value={editData.password}
                                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                    placeholder="Biarkan kosong jika tidak ingin mengubah password"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>Role Hak Akses</Label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Paket (Upload Limit)</Label>
                                    <select
                                        value={editData.plan}
                                        onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="starter">Starter (Max 2 Proyek)</option>
                                        <option value="basic">Basic (Max 5 Proyek)</option>
                                        <option value="pro">Pro (Max 10 Proyek)</option>
                                        <option value="business">Business (Max 15 Proyek)</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={updating} className="bg-[#2cb1bc] hover:bg-[#239099] text-slate-900 font-bold">
                                    {updating ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Update User &amp; Paket
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
                                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser?.name}</strong> ({deletingUser?.email})? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button variant="outline" onClick={() => setDeletingUser(null)}>Batal</Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleting}>
                                {deleting ? <Loader2 className="size-4 animate-spin mr-1" /> : null} Hapus User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
