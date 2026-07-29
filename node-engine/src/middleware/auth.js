/**
 * Middleware to protect internal endpoints.
 */
function internalAuth(secret) {
    return (req, res, next) => {
        const key = req.headers['x-internal-api-key'];
        if (!key || key !== secret) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };
}

module.exports = { internalAuth };
