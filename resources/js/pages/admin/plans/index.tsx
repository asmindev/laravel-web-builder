import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, Check, CreditCard, Edit, Loader2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';

export interface PlanItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number | string;
    price_period: string;
    project_limit: number;
    features: string[] | null;
    is_active: boolean;
    is_popular: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

interface IndexProps {
    plans: PlanItem[];
}

export default function PlanIndex({ plans }: IndexProps) {
    const [showCreate, setShowCreate] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
    const [deletingPlan, setDeletingPlan] = useState<PlanItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Create Form
    const createForm = useForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        price_period: '/bln',
        project_limit: 5,
        features: [''],
        is_active: true,
        is_popular: false,
        sort_order: (plans.length || 0) + 1,
    });

    // Edit Form
    const editForm = useForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        price_period: '/bln',
        project_limit: 5,
        features: [''],
        is_active: true,
        is_popular: false,
        sort_order: 1,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.plans.store'), {
            onSuccess: () => {
                setShowCreate(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (plan: PlanItem) => {
        setEditingPlan(plan);
        editForm.setData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            price: Number(plan.price) || 0,
            price_period: plan.price_period || '/bln',
            project_limit: plan.project_limit || 2,
            features: plan.features && plan.features.length > 0 ? [...plan.features] : [''],
            is_active: Boolean(plan.is_active),
            is_popular: Boolean(plan.is_popular),
            sort_order: plan.sort_order || 1,
        });
        editForm.clearErrors();
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;

        editForm.put(route('admin.plans.update', editingPlan.id), {
            onSuccess: () => {
                setEditingPlan(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingPlan) return;
        setDeleting(true);

        router.delete(route('admin.plans.destroy', deletingPlan.id), {
            onSuccess: () => setDeletingPlan(null),
            onFinish: () => setDeleting(false),
        });
    };

    // Feature array helpers
    const addFeature = (form: typeof createForm | typeof editForm) => {
        form.setData('features', [...form.data.features, '']);
    };

    const removeFeature = (form: typeof createForm | typeof editForm, index: number) => {
        const updated = form.data.features.filter((_, i) => i !== index);
        form.setData('features', updated.length > 0 ? updated : ['']);
    };

    const updateFeature = (form: typeof createForm | typeof editForm, index: number, value: string) => {
        const updated = [...form.data.features];
        updated[index] = value;
        form.setData('features', updated);
    };

    return (
        <AdminLayout header={<h2 className="text-xl leading-tight font-semibold">Kelola Paket &amp; Langganan</h2>}>
            <Head title="Admin — Kelola Paket Langganan" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="size-6 text-primary" /> Daftar Paket Langganan
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pilihan paket, kuota upload proyek, harga, dan fitur untuk pengguna.
                        </p>
                    </div>

                    <Button onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0">
                        <Plus className="size-4" /> Tambah Paket Baru
                    </Button>
                </div>

                {/* Plans Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-3">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`flex flex-col justify-between relative transition-all ${plan.is_popular ? 'border-2 border-primary shadow-lg' : ''}`}>
                            {plan.is_popular && (
                                <div className="absolute -top-3.5 right-4 z-10 bg-primary text-primary-foreground text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md">
                                    Populer
                                </div>
                            )}

                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant={plan.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                        {plan.is_active ? 'Aktif' : 'Non-aktif'}
                                    </Badge>
                                    <span className="font-mono text-xs text-muted-foreground">Slug: {plan.slug}</span>
                                </div>
                                <CardTitle className="text-xl font-bold mt-2">{plan.name}</CardTitle>
                                <CardDescription className="line-clamp-2 text-xs">{plan.description || 'Tidak ada deskripsi'}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4 flex-1">
                                <div className="border-y py-3 space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                                            Rp {Number(plan.price).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium">{plan.price_period}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-primary">
                                        Limit: {plan.project_limit} Upload Proyek
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fitur Paket:</span>
                                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                                        {(plan.features || []).map((feat, idx) => (
                                            <li key={idx} className="flex items-center gap-1.5">
                                                <Check className="size-3.5 text-emerald-500 shrink-0" />
                                                <span className="line-clamp-1">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>

                            <div className="p-4 pt-0 border-t flex items-center justify-between gap-2 mt-4">
                                <Button variant="outline" size="sm" onClick={() => openEditModal(plan)} className="w-full gap-1 text-xs">
                                    <Edit className="size-3.5" /> Edit Paket
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setDeletingPlan(plan)} className="shrink-0 text-red-600 hover:text-red-700 border-red-500/30">
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Create Plan Modal */}
                <Dialog open={showCreate} onOpenChange={(open) => {
                    setShowCreate(open);
                    if (!open) createForm.reset();
                }}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Tambah Paket Langganan Baru</DialogTitle>
                            <DialogDescription>Buat paket baru untuk mengatur limit proyek, harga, dan fitur.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                            {createForm.hasErrors && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>Silakan periksa kembali isian form paket Anda.</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="cp-name">Nama Paket</Label>
                                    <Input
                                        id="cp-name"
                                        value={createForm.data.name}
                                        onChange={(e) => {
                                            createForm.setData('name', e.target.value);
                                            if (!createForm.data.slug) {
                                                createForm.setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                                            }
                                        }}
                                        placeholder="Contoh: Pro Builder"
                                        required
                                    />
                                    {createForm.errors.name && <p className="text-xs text-red-500">{createForm.errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cp-slug">Slug Sistem (Unik)</Label>
                                    <Input
                                        id="cp-slug"
                                        value={createForm.data.slug}
                                        onChange={(e) => createForm.setData('slug', e.target.value)}
                                        placeholder="contoh: pro"
                                        required
                                    />
                                    {createForm.errors.slug && <p className="text-xs text-red-500">{createForm.errors.slug}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="cp-desc">Deskripsi Singkat</Label>
                                <Textarea
                                    id="cp-desc"
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    placeholder="Penjelasan singkat manfaat paket ini"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="cp-price">Harga (Rp)</Label>
                                    <Input
                                        id="cp-price"
                                        type="number"
                                        min={0}
                                        value={createForm.data.price}
                                        onChange={(e) => createForm.setData('price', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cp-period">Periode</Label>
                                    <Input
                                        id="cp-period"
                                        value={createForm.data.price_period}
                                        onChange={(e) => createForm.setData('price_period', e.target.value)}
                                        placeholder="/bln"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="cp-limit">Limit Proyek</Label>
                                    <Input
                                        id="cp-limit"
                                        type="number"
                                        min={1}
                                        value={createForm.data.project_limit}
                                        onChange={(e) => createForm.setData('project_limit', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold">Daftar Fitur Paket</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addFeature(createForm)} className="h-7 text-xs gap-1">
                                        <Plus className="size-3" /> Tambah Fitur
                                    </Button>
                                </div>

                                {createForm.data.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={feat}
                                            onChange={(e) => updateFeature(createForm, idx, e.target.value)}
                                            placeholder={`Fitur #${idx + 1}`}
                                            className="h-9 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeature(createForm, idx)}
                                            className="size-9 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="cp-active"
                                        type="checkbox"
                                        checked={createForm.data.is_active}
                                        onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                                    />
                                    <Label htmlFor="cp-active" className="text-xs font-semibold cursor-pointer">Status Aktif</Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="cp-popular"
                                        type="checkbox"
                                        checked={createForm.data.is_popular}
                                        onChange={(e) => createForm.setData('is_popular', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                                    />
                                    <Label htmlFor="cp-popular" className="text-xs font-semibold cursor-pointer">Tandai Populer</Label>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="cp-sort" className="text-xs">Urutan Tampil</Label>
                                    <Input
                                        id="cp-sort"
                                        type="number"
                                        value={createForm.data.sort_order}
                                        onChange={(e) => createForm.setData('sort_order', Number(e.target.value))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Simpan Paket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Plan Modal */}
                <Dialog open={!!editingPlan} onOpenChange={(open) => {
                    if (!open) {
                        setEditingPlan(null);
                        editForm.reset();
                    }
                }}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Paket {editingPlan?.name}</DialogTitle>
                            <DialogDescription>Ubah detail paket, batas kuota upload, dan fitur.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            {editForm.hasErrors && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>Silakan periksa kembali isian form paket Anda.</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ep-name">Nama Paket</Label>
                                    <Input
                                        id="ep-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ep-slug">Slug Sistem</Label>
                                    <Input
                                        id="ep-slug"
                                        value={editForm.data.slug}
                                        onChange={(e) => editForm.setData('slug', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="ep-desc">Deskripsi Singkat</Label>
                                <Textarea
                                    id="ep-desc"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="ep-price">Harga (Rp)</Label>
                                    <Input
                                        id="ep-price"
                                        type="number"
                                        min={0}
                                        value={editForm.data.price}
                                        onChange={(e) => editForm.setData('price', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ep-period">Periode</Label>
                                    <Input
                                        id="ep-period"
                                        value={editForm.data.price_period}
                                        onChange={(e) => editForm.setData('price_period', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="ep-limit">Limit Proyek</Label>
                                    <Input
                                        id="ep-limit"
                                        type="number"
                                        min={1}
                                        value={editForm.data.project_limit}
                                        onChange={(e) => editForm.setData('project_limit', Number(e.target.value))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold">Daftar Fitur Paket</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addFeature(editForm)} className="h-7 text-xs gap-1">
                                        <Plus className="size-3" /> Tambah Fitur
                                    </Button>
                                </div>

                                {editForm.data.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={feat}
                                            onChange={(e) => updateFeature(editForm, idx, e.target.value)}
                                            placeholder={`Fitur #${idx + 1}`}
                                            className="h-9 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeature(editForm, idx)}
                                            className="size-9 shrink-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="ep-active"
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                                    />
                                    <Label htmlFor="ep-active" className="text-xs font-semibold cursor-pointer">Status Aktif</Label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        id="ep-popular"
                                        type="checkbox"
                                        checked={editForm.data.is_popular}
                                        onChange={(e) => editForm.setData('is_popular', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary cursor-pointer"
                                    />
                                    <Label htmlFor="ep-popular" className="text-xs font-semibold cursor-pointer">Tandai Populer</Label>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="ep-sort" className="text-xs">Urutan Tampil</Label>
                                    <Input
                                        id="ep-sort"
                                        type="number"
                                        value={editForm.data.sort_order}
                                        onChange={(e) => editForm.setData('sort_order', Number(e.target.value))}
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Update Paket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Plan Modal */}
                <Dialog open={!!deletingPlan} onOpenChange={(open) => !open && setDeletingPlan(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus Paket Langganan</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus paket <strong>{deletingPlan?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2">
                            <Button variant="outline" onClick={() => setDeletingPlan(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleting}>
                                {deleting ? <Loader2 className="mr-1 size-4 animate-spin" /> : null} Hapus Paket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
