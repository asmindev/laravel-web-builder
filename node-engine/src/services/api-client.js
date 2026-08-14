const axios = require('axios');

/**
 * Consumes the Laravel Internal API to fetch published project data.
 * Node Engine never accesses the database directly.
 */
class ApiClient {
    constructor(baseUrl, secret) {
        this.client = axios.create({
            baseURL: `${baseUrl}/api/internal`,
            headers: {
                'X-Internal-Api-Key': secret,
                Accept: 'application/json',
            },
            timeout: 5000,
        });
    }

    /**
     * Fetch a published project by slug.
     * @returns {object|null} { slug, template, config, files, assets, published }
     */
    async fetchProject(slug) {
        try {
            const { data } = await this.client.get(`/projects/${slug}`);
            return data;
        } catch (err) {
            if (err.response?.status === 404) return null;
            if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED' || err.message?.includes('timeout')) {
                console.warn(`[ApiClient] Fetch project '${slug}' timed out or failed to connect to Laravel: ${err.message}`);
                return null;
            }
            throw err;
        }
    }
}

module.exports = { ApiClient };
