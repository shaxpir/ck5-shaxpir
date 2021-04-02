const path = require( "path" );
const {
  getPostCssConfig
} = require( "@ckeditor/ckeditor5-dev-utils" ).styles;
const webpack = require( "webpack" );

const SRC_PATH_GLOB = "tests/**/*.js";

const webpackConfig = {
  mode: "development",

  module: {
    rules: [ {
        test: /\.(sa|sc|c)ss$/,
        exclude: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [ {
            loader: "style-loader",
          },
          "css-loader?sourceMap",
          "sass-loader?sourceMap",
        ],
      },
      {
        test: [ /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/, /\.svg$/ ],
        use: [ "raw-loader" ],
      },
      {
        test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
        use: [ {
            loader: "style-loader",
            options: {
              injectType: "singletonStyleTag",
              attributes: {
                "data-cke": true,
              },
            },
          },
          {
            loader: "postcss-loader",
            options: getPostCssConfig( {
              themeImporter: {
                themePath: require.resolve( "@ckeditor/ckeditor5-theme-lark" ),
              },
              minify: true,
            } ),
          },
        ],
      },
    ],
  }
};

module.exports = ( config ) => {
  const basePath = process.cwd();

  config.set( {
    basePath,

    frameworks: [ "mocha", "chai", "sinon" ],

    files: [
      SRC_PATH_GLOB
    ],

    preprocessors: {
      [ SRC_PATH_GLOB ]: [ "webpack", "sourcemap" ]
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true,
      stats: "minimal",
    },

    // Test results reporter to use. Possible values: 'dots', 'progress'.
    // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ "mocha" ],

    // Web server port.
    port: 9876,

    // Enable/Disable colors in the output (reporters and logs).
    colors: true,

    // Level of logging. Possible values:
    // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: "INFO",

    // Start these browsers.
    // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ "CHROME_LOCAL" ],

    customLaunchers: {
      CHROME_TRAVIS_CI: {
        base: "Chrome",
        flags: [ "--no-sandbox", "--disable-background-timer-throttling", '--js-flags="--expose-gc"' ],
      },
      CHROME_LOCAL: {
        base: "Chrome",
        flags: [ "--disable-background-timer-throttling", '--js-flags="--expose-gc"', "--remote-debugging-port=9222" ],
      },
    },

    // Continuous Integration mode. If true, Karma captures browsers, runs the tests and exits.
    singleRun: true,

    // Concurrency level. How many browser should be started simultaneous.
    concurrency: Infinity,

    // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
    browserNoActivityTimeout: 0,

    // Shows differences in object comparison.
    mochaReporter: {
      showDiff: true,
    },
  } );

  if ( process.argv.includes( "--watch" ) ) {
    config.set( {
      singleRun: false,
      autoWatch: true,
    } );
  }
};