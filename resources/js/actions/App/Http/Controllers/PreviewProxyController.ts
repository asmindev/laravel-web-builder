import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
const PreviewProxyController = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PreviewProxyController.url(args, options),
    method: 'get',
})

PreviewProxyController.definition = {
    methods: ["get","head"],
    url: '/app/{slug}/{path?}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
PreviewProxyController.url = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions) => {
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

    return PreviewProxyController.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace('{path?}', parsedArgs.path?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
PreviewProxyController.get = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: PreviewProxyController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
PreviewProxyController.head = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: PreviewProxyController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
const PreviewProxyControllerForm = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PreviewProxyController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
PreviewProxyControllerForm.get = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PreviewProxyController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PreviewProxyController::__invoke
* @see app/Http/Controllers/PreviewProxyController.php:11
* @route '/app/{slug}/{path?}'
*/
PreviewProxyControllerForm.head = (args: { slug: string | number, path?: string | number } | [slug: string | number, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: PreviewProxyController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

PreviewProxyController.form = PreviewProxyControllerForm

export default PreviewProxyController