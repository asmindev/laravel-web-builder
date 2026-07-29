import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\AIController::generate
* @see app/Http/Controllers/AIController.php:13
* @route '/ai/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/ai/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AIController::generate
* @see app/Http/Controllers/AIController.php:13
* @route '/ai/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AIController::generate
* @see app/Http/Controllers/AIController.php:13
* @route '/ai/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AIController::generate
* @see app/Http/Controllers/AIController.php:13
* @route '/ai/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AIController::generate
* @see app/Http/Controllers/AIController.php:13
* @route '/ai/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\AIController::improve
* @see app/Http/Controllers/AIController.php:34
* @route '/ai/improve'
*/
export const improve = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: improve.url(options),
    method: 'post',
})

improve.definition = {
    methods: ["post"],
    url: '/ai/improve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AIController::improve
* @see app/Http/Controllers/AIController.php:34
* @route '/ai/improve'
*/
improve.url = (options?: RouteQueryOptions) => {
    return improve.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AIController::improve
* @see app/Http/Controllers/AIController.php:34
* @route '/ai/improve'
*/
improve.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: improve.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AIController::improve
* @see app/Http/Controllers/AIController.php:34
* @route '/ai/improve'
*/
const improveForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: improve.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AIController::improve
* @see app/Http/Controllers/AIController.php:34
* @route '/ai/improve'
*/
improveForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: improve.url(options),
    method: 'post',
})

improve.form = improveForm

const ai = {
    generate: Object.assign(generate, generate),
    improve: Object.assign(improve, improve),
}

export default ai