import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { TooltipProvider } from "@/components/ui/tooltip"


const appName = import.meta.env.VITE_APP_NAME || 'Nusantara Engine';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
            <TooltipProvider>
                <Toaster />
                <App {...props} />
            </TooltipProvider>
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

import { route as routeFn } from 'ziggy-js';
import { Ziggy } from './ziggy';

// Dynamically bind location.origin to Ziggy so URLs never default to hardcoded localhost
if (typeof window !== 'undefined') {
    (Ziggy as any).url = window.location.origin;
}

// @ts-ignore
window.route = (name?: any, params?: any, absolute?: any, config: any = Ziggy) => {
    const activeConfig = (typeof window !== 'undefined' && (window as any).Ziggy)
        ? { ...(window as any).Ziggy, url: window.location.origin }
        : { ...config, url: typeof window !== 'undefined' ? window.location.origin : config?.url };

    return routeFn(name, params, absolute, activeConfig);
};
