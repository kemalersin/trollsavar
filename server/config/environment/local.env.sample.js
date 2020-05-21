// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:9000',
    SESSION_SECRET: 'trollsavar-secret',

    TWITTER_ID: 'app-id',
    TWITTER_SECRET: 'secret',
    TWITTER_MASTER: '',

    // Control debug level for modules using visionmedia/debug
    DEBUG: '',

    BLOCK_ROUTE: 'block',
    BLOCK_LIMIT_PER_APP: 10000,
    BLOCK_LIMIT_PER_USER: 900,

    REDIRECT_URL: 'https://twitter.com/isimsizhareket'
};
