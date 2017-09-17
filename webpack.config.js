var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var WebpackManifestPlugin = require('webpack-yam-plugin');

const IS_DEV_SERVER = process.argv[1].indexOf('webpack-dev-server') >= 0;

module.exports = {
  entry: {
    javascript: './frontend/main.js',
    styles: './frontend/main.scss'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: `[name]${IS_DEV_SERVER ? '' : '-[hash]'}.js`
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-2']
        }
      },
      {
        test: /.(scss|css)$/,
        loader: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader']
        })
        //loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(jpg|png|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
          //path: 'frontend/build'
        }
      },
      {
        test: /node_modules.*\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: "file-loader",
        options: {
          //path: 'frontend/build'
        }
      },
    ]
  },
  plugins: [
    new ExtractTextPlugin(`[name]${IS_DEV_SERVER ? '' : '-[hash]'}.css`),
    new webpack.DefinePlugin({
      API_URL: JSON.stringify(process.env.API_URL || ''),
      RAVEN_CONFIG: JSON.stringify(process.env.RAVEN_CONFIG || '')
    }),
    new WebpackManifestPlugin({
      manifestPath: path.resolve(__dirname, 'build/webpack_manifest.json'),
      outputRoot: __dirname
    })
  ]
};
