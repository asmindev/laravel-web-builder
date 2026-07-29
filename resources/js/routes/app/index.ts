import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
export const preview = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/app/{slug}/{path?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
preview.url = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            slug: args[0],
            path: args[1],
        }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
        "path",
    ])

    const parsedArgs = {
        slug: args.slug,
        path: args.path,
    }

    return preview.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
preview.get = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
preview.head = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
const previewForm = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
previewForm.get = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
previewForm.head = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview.form = previewForm

const app = {
    preview: Object.assign(preview, preview),
}

export default app