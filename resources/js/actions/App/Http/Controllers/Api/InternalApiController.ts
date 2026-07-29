import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
export const project = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: project.url(args, options),
    method: 'get',
})

project.definition = {
    methods: ["get","head"],
    url: '/api/internal/projects/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
project.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    if (Array.isArray(args)) {
        args = {
            slug: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slug: args.slug,
    }

    return project.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
project.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: project.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
project.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: project.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
const projectForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: project.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
projectForm.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: project.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\InternalApiController::project
* @see app/Http/Controllers/Api/InternalApiController.php:14
* @route '/api/internal/projects/{slug}'
*/
projectForm.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: project.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

project.form = projectForm

const InternalApiController = { project }

export default InternalApiController