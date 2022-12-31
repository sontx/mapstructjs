const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: false,
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'mapstructjs.js',
    path: path.resolve(__dirname, 'playground/src'),
  },
};
