/*eslint no-process-env:0*/

export const env = process.env.NODE_ENV;
export const port = process.env.PORT || 9000;
// List of user roles
export const userRoles = ['user', 'member', 'admin'];

export const dataLimit = 20;

export default {
    env,
    port,
    userRoles,
    dataLimit
};
