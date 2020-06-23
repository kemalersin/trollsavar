import path from 'path';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';

import errors from './components/errors';
import config from './config/environment';

export default function (app) {
    var env = process.env.NODE_ENV;

    app.use('/api/captcha', require('./api/captcha'));    

    app.use('/api/logs', require('./api/log'));
    app.use('/api/stats', require('./api/stat'));
    app.use('/api/blocks', require('./api/block'));
    app.use('/api/users', require('./api/user'));
    app.use('/api/members', require('./api/member'));
    app.use('/auth', require('./auth').default);
    
    app.set('appPath', path.join(config.root, 'client'));
    app.use(express.static(app.get('appPath')));
    
    if(env === 'production') {
        app.use('/', expressStaticGzip(app.get('appPath')));
    }

    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
        });
}
