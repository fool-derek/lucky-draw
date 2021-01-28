module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    devtool: 'source-map'
  }
};
