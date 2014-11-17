process.env.NODEWEBKIT_BIN = '/Users/Will/DEv/dogui/resources/node-webkit/MacOS64/node-webkit.app/Contents/MacOS/node-webkit';
process.env.NODE_PATH = '/Users/Will/DEv/dogui/app/node_modules';
process.env.APP_PATH = '/Users/Will/DEv/dogui/app';
// Karma configuration
// Generated on Mon Nov 17 2014 15:52:16 GMT+1100 (EST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [ 
      'bower_components/jquery/dist/jquery.js',      
      'bower_components/angular/angular.js',      
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-mocks/angular-mocks.js',      
      'bower_components/ui-router/release/angular-ui-router.js',
      'bower_components/ui-ace-git/src/ui-ace.js',
      'js/src/**/*.js',
      'js/test/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['NodeWebkit'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
