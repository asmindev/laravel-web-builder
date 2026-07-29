# Laravel React Admin Boilerplate

A modern, production-ready boilerplate for building web applications with Laravel 12, React 19, Inertia.js 2.0, and Shadcn UI.

![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=flat&logo=laravel)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react)
![Inertia](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=flat)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat&logo=tailwind-css)

## 🚀 Features

- **Latest Stack**: Laravel 12, React 19, Inertia.js 2.0, Vite 6.
- **UI Components**: [Shadcn UI](https://ui.shadcn.com) pre-configured with Tailwind CSS 4.
- **Authentication**: Laravel Fortify (Headless Auth) integrated with Inertia.
- **Routing**: [Ziggy](https://github.com/tighten/ziggy) globally configured for named routes in React.
- **Typing**: TypeScript support with global type definitions for Inertia PageProps.
- **Layout**: Ready-to-use Admin Layout with Shadcn Sidebar.
- **Icons**: [Lucide React](https://lucide.dev) icons.
- **Form Handling**: Native Inertia `useForm` (No React Hook Form).
- **Notifications**: Flash messages integrated with `sonner`.

## 🛠 Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
    ```

2.  **Install PHP dependencies**

    ```bash
    composer install
    ```

3.  **Install Node.js dependencies**

    ```bash
    npm install
    ```

4.  **Environment Setup**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

5.  **Database Setup**
    Configure your `.env` with your database credentials, then run:

    ```bash
    php artisan migrate
    ```

6.  **Run Development Server**

    ```bash
    npm run dev
    ```

    In a separate terminal:

    ```bash
    php artisan serve
    ```

## 🏗 Project Structure

- **Resources**: Kebab-case naming convention enforced for all React files (`resources/js`).
- **Layouts**: `admin-layout.tsx` handling Sidebar and Flash messages.
- **Pages**: Located in `resources/js/pages`.
- **Components**: Shadcn components in `resources/js/components/ui`.

## 💡 Usage

### Creating a New Page

Create a file in `resources/js/pages/my-page.tsx`:

```tsx
import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function MyPage() {
    return (
        <AdminLayout header={<h2>My Page</h2>}>
            <Head title="My Page" />
            <div className="p-4">Content goes here</div>
        </AdminLayout>
    );
}
```

### Form Handling (Inertia)

Use the `useForm` hook from `@inertiajs/react`:

```tsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function MyForm() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('my-route.store'));
    };

    return (
        <form onSubmit={submit}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <div className="text-red-500">{errors.name}</div>}

            <Button disabled={processing}>Submit</Button>
        </form>
    );
}
```
