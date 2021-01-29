module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.lucky-draw.app',
        win: {
          icon: './src/assets/icon.ico',
          target: 'msi'
        },
        mac: {
          icon: './src/assets/icon.icns',
          category: 'public.app-category.games'
        }
      }
    }
  }
};
