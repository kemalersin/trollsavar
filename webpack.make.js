/*eslint-env node*/
const _ = require('lodash');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = function makeWebpackConfig(options) {
    /**
     * Environment type
     * BUILD is for generating minified builds
     * TEST is for generating test builds
     */
    const BUILD = !!options.BUILD;
    const TEST = !!options.TEST;
    const DEV = !!options.DEV;

    /**
     * Config
     * Reference: http://webpack.github.io/docs/configuration.html
     * This is the object where all configuration gets set
     */
    const config = {};

    config.mode = BUILD
        ? 'production'
        : 'development';

    /**
     * Entry
     * Reference: http://webpack.github.io/docs/configuration.html#entry
     * Should be an empty object if it's generating a test build
     * Karma will set this when it's a test build
     */
    if (!TEST) {
        config.entry = {
            polyfills: './client/app/polyfills.ts',
            vendor: [
                'lodash'
            ],
            app: './client/app/app.ts'
        };
    }

    /**
     * Output
     * Reference: http://webpack.github.io/docs/configuration.html#output
     * Should be an empty object if it's generating a test build
     * Karma will handle setting it up for you when it's a test build
     */
    if (TEST) {
        config.output = {};
    } else {
        config.output = {
            // Absolute output directory
            path: BUILD ? path.join(__dirname, '/dist/client/') : path.join(__dirname, '/.tmp/'),

            // Output path from the view of the page
            // Uses webpack-dev-server in development
            publicPath: BUILD || DEV ? '/' : `http://localhost:${8080}/`,
            //publicPath: BUILD ? '/' : 'http://localhost:' + env.port + '/',

            // Filename for entry points
            // Only adds hash in build mode
            filename: BUILD ? '[name].[hash].js' : '[name].bundle.js',

            // Filename for non-entry points
            // Only adds hash in build mode
            chunkFilename: BUILD ? '[name].[hash].js' : '[name].bundle.js'
        };
    }

    config.resolve = {
        modules: ['node_modules'],
        extensions: ['.js', '.ts'],
        alias: {
            primus: path.resolve(__dirname, 'client/components/socket/primus.js'),
        }
    };

    if (TEST) {
        config.resolve = {
            modules: [
                'node_modules'
            ],
            extensions: ['.js', '.ts'],
            alias: {
                // for some reason the primus client and webpack don't get along in test
                primus: path.resolve(__dirname, 'client/components/socket/primus.mock.ts'),
            }
        };
    }

    /**
     * Devtool
     * Reference: http://webpack.github.io/docs/configuration.html#devtool
     * Type of sourcemap to use per build type
     */
    if (TEST) {
        config.devtool = 'inline-source-map';
    } else if (BUILD || DEV) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval';
    }

    /**
     * Loaders
     * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
     * List: http://webpack.github.io/docs/list-of-loaders.html
     * This handles most of the magic responsible for converting modules
     */

    // Initialize module
    config.module = {
        rules: [{
            // JS LOADER
            // Reference: https://github.com/babel/babel-loader
            // Transpile .js files using babel-loader
            // Compiles ES6 and ES7 into ES5 code
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['babel-preset-env', {
                            // debug: true,
                            targets: {
                                browsers: ['last 2 versions', 'not dead'],
                            },
                            debug: true,
                            modules: false,
                        }]
                    ],
                    plugins: [
                        'angular2-annotations',
                        'transform-runtime',
                        'transform-decorators-legacy',
                        'transform-class-properties',
                        'transform-export-extensions',
                    ].concat(TEST ? ['istanbul'] : []),
                }
            }].concat(DEV ? '@angularclass/hmr-loader' : []),
            include: [
                path.resolve(__dirname, 'client/'),
                path.resolve(__dirname, 'server/config/environment/shared.js'),
                path.resolve(__dirname, 'node_modules/lodash-es/'),
            ]
        }, {
            // TS LOADER
            // Reference: https://github.com/s-panferov/awesome-typescript-loader
            // Transpile .ts files using awesome-typescript-loader
            test: /\.ts$/,
            use: [{
                loader: 'awesome-typescript-loader',
                options: {
                    tsconfig: path.resolve(__dirname, 'tsconfig.json')
                },
            }].concat(DEV ? '@angularclass/hmr-loader' : []),
            include: [
                path.resolve(__dirname, 'client/')
            ]
        }, {
            // ASSET LOADER
            // Reference: https://github.com/webpack/file-loader
            // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
            // Rename the file using the asset hash
            // Pass along the updated reference to your code
            // You can add here any file extension you want to get copied to your output
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)([\?]?.*)$/,
            use: 'file-loader'
        }, {
            // Pug HTML LOADER
            // Reference: https://github.com/willyelm/pug-html-loader
            // Allow loading Pug throw js
            test: /\.(jade|pug)$/,
            use: ['raw-loader', 'pug-html-loader']
        }, {

            // CSS LOADER
            // Reference: https://github.com/webpack/css-loader
            // Allow loading css through js
            //
            // Reference: https://github.com/postcss/postcss-loader
            // Postprocess your css with PostCSS plugins
            test: /\.css$/,
            use: [
                DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader',
                'postcss-loader',
            ],
            include: [
                path.resolve(__dirname, 'node_modules/bootstrap/dist/css/*.css'),
                path.resolve(__dirname, 'client/app/app.css')
            ]
        }, {
            // SASS LOADER
            // Reference: https://github.com/jtangelder/sass-loader
            test: /\.(scss|sass)$/,
            use: [
                DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
                'css-loader?sourceMap',
                'postcss-loader',
                'sass-loader',
            ],
            include: [
                path.resolve(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets/*.scss'),
                path.resolve(__dirname, 'client/app/app.scss')
            ]
        }, {
            // SASS LOADER
            // Reference: https://github.com/jtangelder/sass-loader
            test: /\.(scss|sass)$/,
            use: [
                'to-string-loader?sourceMap',
                'css-loader?sourceMap',
                'postcss-loader',
                'sass-loader?sourceMap',
            ],
            include: [
                path.resolve(__dirname, 'client')
            ],
            exclude: [/app\.scss$/]
        }]
    };

    //TODO: TS Instrumenter

    /**
     * Plugins
     * Reference: http://webpack.github.io/docs/configuration.html#plugins
     * List: http://webpack.github.io/docs/list-of-plugins.html
     */
    config.plugins = [
        // Hides the 'the request of a dependency is an expression' warnings
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core/,
            path.resolve(__dirname, '../src')
        ),

        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname
            },
            sassLoader: {
                outputStyle: 'compressed',
                precision: 10,
                sourceComments: false
            },

        })
    ];

    if (BUILD) {
        config.plugins.push(
            new CompressionPlugin({}),
            // https://github.com/webpack-contrib/mini-css-extract-plugin
            new MiniCssExtractPlugin({
                filename: '[name].[hash].css',
                chunkFilename: '[id].[hash].css',
            }),
        );
    }

    // Skip rendering app.html in test mode
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render app.html
    if (!TEST) {
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: 'client/app.template.html',
                filename: '../client/app.html',
                alwaysWriteToDisk: true,
            }),
            new HtmlWebpackHarddiskPlugin(),
        );
    }

    let localEnv;
    try {
        localEnv = require('./server/config/local.env').default;
    } catch (e) {
        localEnv = {};
    }
    localEnv = _.mapValues(localEnv, value => `"${value}"`);
    localEnv = _.mapKeys(localEnv, (value, key) => `process.env.${key}`);

    let env = _.merge({
        'process.env.NODE_ENV': DEV ? '"development"'
            : BUILD ? '"production"'
                : TEST ? '"test"'
                    : '"development"'
    }, localEnv);

    // Reference: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    // Define free global variables
    config.plugins.push(new webpack.DefinePlugin(env));

    if (DEV) {
        config.plugins.push(
            new webpack.HotModuleReplacementPlugin(),
        );
    }

    config.cache = DEV;

    if (BUILD) {
        config.optimization = {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: true
                    },
                },
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true // set to true if you want JS source maps
                }),
                new OptimizeCssAssetsPlugin({
                    cssProcessorOptions: {
                        safe: true
                    }
                }),
            ],
        };
    }

    if (TEST) {
        config.stats = {
            colors: true,
            reasons: true
        };
    }

    /**
     * Dev server configuration
     * Reference: http://webpack.github.io/docs/configuration.html#devserver
     * Reference: http://webpack.github.io/docs/webpack-dev-server.html
     */
    config.devServer = {
        contentBase: './client/',
        hot: true,
        proxy: {
            '/api': {
                target: 'http://localhost:9000',
                secure: false,
            },
            '/auth': {
                target: 'http://localhost:9000',
                secure: false,
            },
        },
        stats: {
            modules: false,
            cached: false,
            colors: true,
            chunks: false,
        },
        historyApiFallback: {
            index: 'app.html'
        },
    };

    config.node = {
        global: true,
        process: true,
        crypto: false,
        clearImmediate: false,
        setImmediate: false,
    };

    return config;
};
