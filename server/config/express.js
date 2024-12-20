/**
 * Express configuration
 */

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import path from 'path';
import lusca from 'lusca';
import config from './environment';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

var MongoStore = connectMongo(session);

export default function(app) {
    var env = process.env.NODE_ENV;

    if(env === 'development' || env === 'test') {
        app.use(express.static(path.join(config.root, '.tmp')));
        app.use(require('cors')());
    }

    if(env === 'production') {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    }

    app.use(morgan('dev'));

    app.set('views', `${config.root}/server/views`);
    app.set('view engine', 'pug');
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());


    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions
    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            db: 'trollsavar'
        })
    }));

    /**
     * Lusca - express server security
     * https://github.com/krakenjs/lusca
     */
    if(env !== 'test' && env !== 'development') {
        app.use(lusca({
            /*csrf: {
                header: 'x-xsrf-token'
            },*/
            xframe: 'SAMEORIGIN',
            hsts: {
                maxAge: 31536000, //1 year, in seconds
                includeSubDomains: true,
                preload: true
            },
            xssProtection: true
        }));
    }

    if(env === 'development' || env === 'test') {
        app.use(errorHandler()); // Error handler - has to be last
    }
}
