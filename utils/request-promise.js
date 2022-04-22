const rp = require('request-promise')

exports.useRp = (url) =>
    rp({
        url,
        headers: {
            'User-Agent': 'Request-Promise',
        },
        json: true,
    })
