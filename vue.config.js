module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.lucky-draw.app',
        publish: null,
        win: {
          icon: './src/assets/icon.ico'
        },
        mac: {
          icon: './src/assets/icon.icns',
          category: 'public.app-category.games'
        }
      }
    }
  }
};
