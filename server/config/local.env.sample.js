// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    PORT: 8080,
    CLIENT_PORT: 8080,
    DOMAIN: 'http://localhost:9000',
    SESSION_SECRET: 'trollsavar-secret',

    TWITTER_ID: 'app-id',
    TWITTER_SECRET: 'secret',
    TWITTER_MASTER: '',

    TWITTER_ACCESS_TOKEN: '',
    TWITTER_TOKEN_SECRET: '',

    MAIL_HOST: '',
    MAIL_PORT: 465,
    MAIL_USER: '',
    MAIL_PASS: '',
    MAIL_FROM: '',      

    // Control debug level for modules using visionmedia/debug
    DEBUG: '',

    BLOCK_ROUTE: 'block',
    BLOCK_LIMIT_PER_APP: 900000,
    BLOCK_LIMIT_PER_USER: 900,

    REDIRECT_URL: 'https://twitter.com/isimsizhareket'
};
