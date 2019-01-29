const workboxWebpackPlugin = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
    webpack(config, env) {
        const newConfig = config;
        if (env === 'production') {
            const workboxWebpackPluginIndex = config.plugins.findIndex((plugin) => {
                return Object.getPrototypeOf(plugin).constructor.name === 'GenerateSW';
            })
            if (workboxWebpackPluginIndex !== -1) {
                const workboxConfigProd = {
                    swSrc: path.join(__dirname, 'public', 'service-worker.js'),
                    swDest: 'service-worker.js',
                    importWorkboxFrom: 'disabled'
                }
                newConfig.plugins.splice(
                    workboxWebpackPluginIndex, 1,
                    new workboxWebpackPlugin.InjectManifest(workboxConfigProd)
                )
            }
        }
        return newConfig;
    }
}