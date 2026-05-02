/**
 * Build↔runtime type contract. Imported only for editor IntelliSense via JSDoc.
 *
 * @typedef {Object} RegistryEntry
 * @property {string} slug
 * @property {string} name
 * @property {string} tagline
 * @property {string} brand
 * @property {string} version
 * @property {string} summary
 * @property {boolean} hasRest
 * @property {boolean} hasAsync
 * @property {number} restCount
 * @property {number} asyncCount
 * @property {number} schemaCount
 * @property {Array<{slug: string, title: string}>} guides
 *
 * @typedef {{kind: 'ref', name: string}} RefSchema
 * @typedef {{kind: 'primitive', type: string, format?: string, enum?: any[], const?: any,
 *           pattern?: string, minLength?: number, maxLength?: number, minimum?: number,
 *           maximum?: number, default?: any, example?: any}} PrimitiveSchema
 * @typedef {{kind: 'array', items: NormalizedSchema, minItems?: number, maxItems?: number,
 *           uniqueItems?: boolean}} ArraySchema
 * @typedef {{kind: 'object',
 *           properties: Array<{name: string, required: boolean, schema: NormalizedSchema, description: string}>,
 *           additionalProperties?: NormalizedSchema | false, minProperties?: number}} ObjectSchema
 * @typedef {{kind: 'union', variant: 'oneOf'|'anyOf', options: NormalizedSchema[],
 *           discriminator?: {propertyName: string, mapping?: Record<string,string>}}} UnionSchema
 * @typedef {{kind: 'composition', variant: 'allOf', parts: NormalizedSchema[],
 *           merged: NormalizedSchema}} CompositionSchema
 * @typedef {RefSchema|PrimitiveSchema|ArraySchema|ObjectSchema|UnionSchema|CompositionSchema} NormalizedSchema
 *
 * @typedef {Object} NormalizedOperation
 * @property {string} id
 * @property {'get'|'post'|'put'|'patch'|'delete'} method
 * @property {string} path
 * @property {string} tag
 * @property {string} summary
 * @property {string} descriptionHtml
 * @property {boolean} deprecated
 * @property {string[]} security
 * @property {Array<{in: string, name: string, required: boolean, descriptionHtml: string,
 *                  schema: NormalizedSchema, example?: any}>} parameters
 * @property {{required: boolean, contents: Array<{mediaType: string, schema: NormalizedSchema,
 *            examples: Array<{name: string, summary: string, value: any}>}>,
 *           descriptionHtml: string} | undefined} requestBody
 * @property {Array<{status: string, descriptionHtml: string,
 *            headers?: Array<{name: string, description: string, schema: NormalizedSchema | null}>,
 *            contents: Array<{mediaType: string, schema: NormalizedSchema,
 *                             examples: Array<{name: string, summary: string, value: any,
 *                                              json?: string, html?: string}>}>}>} responses
 * @property {Record<'curl'|'js-fetch'|'js-axios'|'python', {raw: string, html: string}>} samples
 *
 * @typedef {Object} NormalizedAsyncOperation
 * @property {string} id
 * @property {string} channel
 * @property {'pub'|'sub'} direction
 * @property {string} summary
 * @property {string} descriptionHtml
 * @property {{name: string, title: string, summary: string, payload: NormalizedSchema,
 *            examples: Array<{name: string, summary: string, value: any, json?: string, html?: string}>}} message
 * @property {Record<string, {raw: string, html: string}>} samples
 *
 * @typedef {Object} NormalizedApi
 * @property {string} slug
 * @property {string} name
 * @property {string} tagline
 * @property {string} brand
 * @property {string} version
 * @property {string} summary
 * @property {string} descriptionHtml
 * @property {Array<{url: string, description: string, protocol?: string}>} servers
 * @property {{schemes: Record<string, any>, defaults: string[]}} security
 * @property {{tags: Array<{name: string, descriptionHtml: string}>, operations: NormalizedOperation[]}} rest
 * @property {{channels: Array<{name: string, direction: string, descriptionHtml: string}>,
 *            operations: NormalizedAsyncOperation[]} | undefined} async
 * @property {Record<string, NormalizedSchema>} schemas
 * @property {string[]} schemaIndex
 * @property {Array<{code: string, messages: string[], sourceOps: string[]}>} errors
 * @property {Array<{slug: string, title: string, html: string, tocHtml: string}>} guides
 * @property {string} overviewHtml
 * @property {string} changelogHtml
 * @property {string} errorsHtml
 * @property {boolean} hasRest
 * @property {boolean} hasAsync
 *
 * @typedef {Object} SearchDoc
 * @property {number} id
 * @property {string} api
 * @property {'operation'|'event'|'schema'|'guide'|'page'} kind
 * @property {string} title
 * @property {string} subtitle
 * @property {string} body
 * @property {string} url
 * @property {string} [tag]
 * @property {string} [method]
 * @property {string} [path]
 * @property {string} [direction]
 * @property {string} [operationId]
 */

export {}
