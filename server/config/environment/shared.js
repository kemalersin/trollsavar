/*eslint no-process-env:0*/

export const env = process.env.NODE_ENV;
export const port = process.env.PORT || 9000;
export const blockRoute = process.env.BLOCK_ROUTE || 'block';
export const blockLimitPerApp = process.env.BLOCK_LIMIT_PER_APP || 900000;
export const blockLimitPerUser = process.env.BLOCK_LIMIT_PER_USER || 900;
export const redirectUrl = process.env.REDIRECT_URL || 'https://twitter.com/isimsizhareket';

// List of user roles
export const userRoles = ['user', 'member', 'admin'];

export const dataLimit = 20;

export default {
    env,
    port,
    userRoles,
    dataLimit,
    redirectUrl,
    blockRoute,
    blockLimitPerApp,
    blockLimitPerUser,
};
