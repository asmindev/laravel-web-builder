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

declare global {
    var route: typeof routeFn;
}

// @ts-ignore
window.route = (name?: any, params?: any, absolute?: any, config: any = Ziggy) => routeFn(name, params, absolute, config);
