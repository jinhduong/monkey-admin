const {
  injectBabelPlugin,
  compose,
  getLoader,
  loaderNameMatches,
} = require("react-app-rewired");
//const rewireLess = require("react-app-rewire-less");
const rewireLess = require("react-app-rewire-less-modules");
const rewireVendorSplitting = require("react-app-rewire-vendor-splitting");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const paths = require("react-app-rewired/scripts/utils/paths");

module.exports = function override(config, env) {
  // https://github.com/heroku/react-refetch/pull/198
  config.resolve.alias["react-refetch"] = "react-refetch-pre";

  config = injectBabelPlugin(
    ["import", { libraryName: "antd", style: true, libraryDirectory: "es" }],
    config,
  );

  if (env === "production") {
    // Remove default polyfills
    config.entry = { main: paths.appIndexJs };

    // Change css module class names in production
    const cssLoader = getLoader(
      config.module.rules,
      rule => String(rule.test) === String(/\.module\.css$/),
    ).loader.find(loader => loaderNameMatches(loader, "css-loader"));
    cssLoader.options.localIdentName = "ma-[hash:base64:8]";

    // Include bundle analyzation
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
      }),
    );
  }

  const rewires = compose(
    rewireLess.withLoaderOptions({
      modifyVars: {
        "@primary-color": "#ff79c6",
        "@info-color": "#61dafb",
        "@layout-body-background": "#EEEEF0",
        "@layout-header-background": "#fff",
        "@layout-sider-background": "#282A36",
        "@menu-dark-bg": "#282A36",
        "@menu-dark-submenu-bg": "#21222c",
      },
    }),
    rewireVendorSplitting,
  );

  return rewires(config, env);
};
