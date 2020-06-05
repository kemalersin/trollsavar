/*eslint no-process-env:0*/

export const env = process.env.NODE_ENV;
export const port = process.env.PORT || 9000;
export const blockLimitPerApp = process.env.BLOCK_LIMIT_PER_APP || 900000;
export const blockLimitPerUser = process.env.BLOCK_LIMIT_PER_USER || 900;
export const redirectUrl = process.env.REDIRECT_URL || 'https://twitter.com/isimsizhareket';

// List of user roles
export const userRoles = ['user', 'member', 'admin'];

export const dataLimit = 20;

export const errors = {
    userNotFound: "Kullanıcı bulunamadı!"
}

export default {
    env,
    port,
    errors,    
    userRoles,
    dataLimit,
    redirectUrl,
    blockLimitPerApp,
    blockLimitPerUser,
};
