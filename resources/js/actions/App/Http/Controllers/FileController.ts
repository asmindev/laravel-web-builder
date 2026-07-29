import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
export const index = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/files',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
index.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { project: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.slug
        : args.project,
    }

    return index.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
index.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
index.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
const indexForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
indexForm.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::index
* @see app/Http/Controllers/FileController.php:14
* @route '/projects/{project}/files'
*/
indexForm.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
export const show = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/files/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
show.url = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            path: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.slug
        : args.project,
        path: args.path,
    }

    return show.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
show.get = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
show.head = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
const showForm = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
showForm.get = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FileController::show
* @see app/Http/Controllers/FileController.php:23
* @route '/projects/{project}/files/{path}'
*/
showForm.head = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\FileController::store
* @see app/Http/Controllers/FileController.php:38
* @route '/projects/{project}/files'
*/
export const store = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/projects/{project}/files',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\FileController::store
* @see app/Http/Controllers/FileController.php:38
* @route '/projects/{project}/files'
*/
store.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { project: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { project: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            project: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.slug
        : args.project,
    }

    return store.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileController::store
* @see app/Http/Controllers/FileController.php:38
* @route '/projects/{project}/files'
*/
store.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FileController::store
* @see app/Http/Controllers/FileController.php:38
* @route '/projects/{project}/files'
*/
const storeForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FileController::store
* @see app/Http/Controllers/FileController.php:38
* @route '/projects/{project}/files'
*/
storeForm.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\FileController::destroy
* @see app/Http/Controllers/FileController.php:60
* @route '/projects/{project}/files/{path}'
*/
export const destroy = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/projects/{project}/files/{path}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\FileController::destroy
* @see app/Http/Controllers/FileController.php:60
* @route '/projects/{project}/files/{path}'
*/
destroy.url = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            project: args[0],
            path: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        project: typeof args.project === 'object'
        ? args.project.slug
        : args.project,
        path: args.path,
    }

    return destroy.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\FileController::destroy
* @see app/Http/Controllers/FileController.php:60
* @route '/projects/{project}/files/{path}'
*/
destroy.delete = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\FileController::destroy
* @see app/Http/Controllers/FileController.php:60
* @route '/projects/{project}/files/{path}'
*/
const destroyForm = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\FileController::destroy
* @see app/Http/Controllers/FileController.php:60
* @route '/projects/{project}/files/{path}'
*/
destroyForm.delete = (args: { project: string | { slug: string }, path: string | number } | [project: string | { slug: string }, path: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const FileController = { index, show, store, destroy }

export default FileController