import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PublishController::publish
* @see app/Http/Controllers/PublishController.php:22
* @route '/projects/{project}/publish'
*/
export const publish = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

publish.definition = {
    methods: ["post"],
    url: '/projects/{project}/publish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PublishController::publish
* @see app/Http/Controllers/PublishController.php:22
* @route '/projects/{project}/publish'
*/
publish.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return publish.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::publish
* @see app/Http/Controllers/PublishController.php:22
* @route '/projects/{project}/publish'
*/
publish.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: publish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::publish
* @see app/Http/Controllers/PublishController.php:22
* @route '/projects/{project}/publish'
*/
const publishForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::publish
* @see app/Http/Controllers/PublishController.php:22
* @route '/projects/{project}/publish'
*/
publishForm.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: publish.url(args, options),
    method: 'post',
})

publish.form = publishForm

/**
* @see \App\Http\Controllers\PublishController::unpublish
* @see app/Http/Controllers/PublishController.php:33
* @route '/projects/{project}/unpublish'
*/
export const unpublish = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublish.url(args, options),
    method: 'post',
})

unpublish.definition = {
    methods: ["post"],
    url: '/projects/{project}/unpublish',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PublishController::unpublish
* @see app/Http/Controllers/PublishController.php:33
* @route '/projects/{project}/unpublish'
*/
unpublish.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return unpublish.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::unpublish
* @see app/Http/Controllers/PublishController.php:33
* @route '/projects/{project}/unpublish'
*/
unpublish.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: unpublish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::unpublish
* @see app/Http/Controllers/PublishController.php:33
* @route '/projects/{project}/unpublish'
*/
const unpublishForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unpublish.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::unpublish
* @see app/Http/Controllers/PublishController.php:33
* @route '/projects/{project}/unpublish'
*/
unpublishForm.post = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: unpublish.url(args, options),
    method: 'post',
})

unpublish.form = unpublishForm

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
export const preview = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
preview.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return preview.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
preview.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
preview.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
const previewForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
previewForm.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::preview
* @see app/Http/Controllers/PublishController.php:44
* @route '/projects/{project}/preview'
*/
previewForm.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview.form = previewForm

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
export const exportJson = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportJson.url(args, options),
    method: 'get',
})

exportJson.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/export-json',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
exportJson.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return exportJson.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
exportJson.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportJson.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
exportJson.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportJson.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
const exportJsonForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportJson.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
exportJsonForm.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportJson.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportJson
* @see app/Http/Controllers/PublishController.php:57
* @route '/projects/{project}/export-json'
*/
exportJsonForm.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportJson.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportJson.form = exportJsonForm

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
export const exportZip = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportZip.url(args, options),
    method: 'get',
})

exportZip.definition = {
    methods: ["get","head"],
    url: '/projects/{project}/export-zip',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
exportZip.url = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
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

    return exportZip.definition.url
            .replace('{project}', parsedArgs.project.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
exportZip.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportZip.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
exportZip.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportZip.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
const exportZipForm = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportZip.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
exportZipForm.get = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportZip.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PublishController::exportZip
* @see app/Http/Controllers/PublishController.php:66
* @route '/projects/{project}/export-zip'
*/
exportZipForm.head = (args: { project: string | { slug: string } } | [project: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportZip.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportZip.form = exportZipForm

/**
* @see \App\Http\Controllers\PublishController::importMethod
* @see app/Http/Controllers/PublishController.php:77
* @route '/projects/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/projects/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PublishController::importMethod
* @see app/Http/Controllers/PublishController.php:77
* @route '/projects/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PublishController::importMethod
* @see app/Http/Controllers/PublishController.php:77
* @route '/projects/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::importMethod
* @see app/Http/Controllers/PublishController.php:77
* @route '/projects/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PublishController::importMethod
* @see app/Http/Controllers/PublishController.php:77
* @route '/projects/import'
*/
importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

importMethod.form = importMethodForm

const PublishController = { publish, unpublish, preview, exportJson, exportZip, importMethod, import: importMethod }

export default PublishController