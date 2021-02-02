module.exports = {
  publicPath: './',
  configureWebpack: {
    devtool: 'source-map'
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: 'com.lucky-draw.app',
        publish: null,
        artifactName: '${name}-${version}.${ext}',
        win: {
          target: 'zip',
          icon: './src/assets/icon.ico'
        },
        mac: {
          target: 'zip',
          icon: './src/assets/icon.icns',
          category: 'public.app-category.games'
        }
      }
    }
  }
};
