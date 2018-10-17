var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var extend = require('extend');
var entry = require('./config/vendor');
var externals = require('./config/externals');
var config = require('./config/base.config');
var alias = require('./config/alias');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var es3ifyPlugin = require('es3ify-webpack-plugin');

var setExternals = function() {
    var external = externals;

    return external;
};

//var baseFileDir = path.join(process.cwd(), 'src/');
var htmlPlugin = [];
var getEntry = function() {
    var webpackConfigEntry = {};
    if (config.root.indexOf('.') != -1) {
        webpackConfigEntry.bundle = [path.join(process.cwd(), config.root)];
    } else {
        var basedir = path.join(process.cwd(), config.root);
        var files = glob.sync(path.join(basedir, '*.jsx'));

        files.forEach(function(file) {
            var relativePath = path.relative(basedir, file);
            // generateHtml(relativePath.replace(/\.jsx/, '').toLowerCase());
            webpackConfigEntry[relativePath.replace(/\.jsx/, '').toLowerCase()] = [file];
        });
    }

    return webpackConfigEntry;
};

function generateHtml(htmlName) {
    //var path = config.html+'/'+htmlName+'.html';
    /*htmlPlugin.push(
        new HtmlWebpackPlugin({
            title: htmlName,
            template: path.resolve(config.html, 'dev.html'),
            filename: htmlName + '.html',
            chunks: ['common', htmlName],
            inject: 'body'
        })

    );*/
}


function setCommonsChuck() {
    var arr = [];
    for (var item in entry) {
        arr.push(item);
    }
    return arr;
}

var webpackConfig = {
    entry: extend(getEntry(), entry || {}),
    output: {
        path: path.join(config.output.replace('./', '')),
        filename: '[name].js',
        libraryTarget: "umd",
        publicPath: config.cdn,//这个目录是用来替换每个文件引用的资源文件的路径，像less中引用的图片,不管是本地调试，还是打包生成
        chunkFilename: '[name].[chunkhash].js',
        sourceMapFilename: '[name].map',
        crossOriginLoading:'anonymous'
    },
    cache: true,
    devtool: 'source-map',
    externals: setExternals(),
    resolve: {
        extensions: ["", ".js", ".ts", ".tsx", ".es6",".jsx"],
        alias: extend({}, alias || {})
    },
    module: {
        // preLoaders: [{
        //     test: /\.(jsx|es6|js)$/,
        //     loaders: ['eslint-loader'],
        //     exclude: /node_modules/
        // }],
        loaders: [{
                test: /\.(js|jsx|es6)$/,
                loaders: ['babel'],
                exclude: /node_modules/
            },
            {
                test: /\.(less$)$/,
                loader: ExtractTextPlugin.extract('css!postcss!less?{modifyVars:{"@primary-color":"#ff6633"}}')
                    //loader: "style-loader!css-loader!less-loader"
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('css?-restructuring!postcss')
            },
            {
                test: /\.css\.module/,
                loader: ExtractTextPlugin.extract('css?-restructuring&modules&localIdentName=[local]___[hash:base64:5]!postcss')
            },
            {
                test: /\.less\.module/,
                loader: ExtractTextPlugin.extract('css?modules&localIdentName=[local]___[hash:base64:5]!postcss!less')

            },
            {
                test: /\.svg$/,
                loader: "url-loader?limit=10000&mimetype=image/svg+xml"
            },
            {
                test: /\.woff|ttf|woff2|eot$/,
                loader: 'url?limit=100000'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'url?limit=35000'
                    /*'image-webpack?progressive&optimizationLevel=3&interlaced=false'*/
                ]
            },
            {
                test: /\.html$/,
                loader: "handlebars-loader"
            }
        ]
    },
    /*postcss: [
        require('autoprefixer'),
        require('postcss-color-rebeccapurple')
    ],*/
    postcss: function() {
        //处理css兼容性代码，无须再写-webkit之类的浏览器前缀
        return [
            require('postcss-initial')({
                reset: 'all' // reset only inherited rules
            }),
            require('autoprefixer')({
                browsers: ['> 5%']
            })
        ];
    },
    plugins: [
        //new webpack.optimize.UglifyJsPlugin(),
        //生成单独的css文件
        new ExtractTextPlugin("[name].css", {
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            //name: "common",
            //filename: "common.js",
            names: setCommonsChuck(),
            minChunks: Infinity

        })
        /*,
                new webpack.optimize.DedupePlugin()*/
    ]
};

config.env =  process.env.NODE_ENV || 'beta'
console.log(config.env);

if (config.env != 'beta' && config.env != 'dev') {
    console.log('..........----pro----.............');
    webpackConfig.plugins.push(
        //压缩js
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    );
    webpackConfig.plugins.push(
        new es3ifyPlugin() //兼容ie8
    );
    webpackConfig.plugins.push(
        new webpack.optimize.DedupePlugin() //查找相等或近似的模块，避免在最终生成的文件中出现重复的模块，比如可以用它去除依赖中重复的插件；
    );
    webpackConfig.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(true) //通过模块调用次数给模块分配ids，常用的ids就会分配更短的id，使ids可预测，减小文件大小
    );
}

module.exports = webpackConfig;
