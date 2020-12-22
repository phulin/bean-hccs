const path = require('path');

module.exports = {
  entry: {
    hccs: './src/index.ts',
    hccs_combat: './src/combat.ts',
    hccs_pre: './src/pre.ts',
    hccs_ascend: './src/ascend.ts',
  },
  mode: 'development',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'KoLmafia', 'scripts', 'bean-hccs'),
    filename: '[name].js',
    libraryTarget: 'commonjs',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        // exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [],
  externals: {
    kolmafia: 'commonjs kolmafia',
    'canadv.ash': 'commonjs canadv.ash',
  },
};
