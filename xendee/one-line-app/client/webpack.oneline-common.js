const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const LinkTypePlugin = require('html-webpack-link-type-plugin').HtmlWebpackLinkTypePlugin
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [
    '@babel/polyfill',
    '../../js/vendor/glide-modular-esm-3.4.1.js',
    '../../js/Pages/StudioOneLineView.js',
    '../../css/Pages/StudioOneLineView.css'
  ],
  stats: 'errors-only',
  output: {
    libraryTarget: "umd",
    filename: "[name].[contenthash].prod.js",
    path: path.resolve(__dirname, './dist'),
    publicPath: '/js/one-line/dist'
  },
  resolve: {
    extensions: [
      '*',
      '.js',
      '.jsx',
      '.css',
    ],
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js'
    },
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
      assert: false,
      os: false
    }
  },
  //externalsPresets: { node: true },  // Ignore built-in modules like path, fs, etc.
  //externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.html$/,
        use: [
          'html-loader'
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(woff|woff2|ttf|otf)(\?.*$|$)/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/fonts/'
          }
        }
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/images/'
          }
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[id].css'
    }),
    new HtmlWebpackPlugin({
      template: '../../Areas/Studio/Views/OneLine/ViewWebpackTemplate.cshtml',
      filename: '../../../Areas/Studio/Views/OneLine/View.cshtml',
      showErrors: true,
      inject: 'body',
      hash: true,
      minify: false
    }),
    //new webpack.HashedModuleIdsPlugin(),
    new LinkTypePlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      "window.$": "jquery",
      Handlebars: "Handlebars",
      moment: "moment",
      axios: "axios",
      numeral: "numeral",
      bootstrap: "bootstrap"
    })
  ],

}

