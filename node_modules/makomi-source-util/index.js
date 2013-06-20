/**
 * Utility functions for working with makomi project source structures
 */

var fs = require('fs');

exports.projectConfig = null;
exports.appConfig = null;

var ready = false;

exports.init = function(appConfig,project) {
  exports.appConfig = appConfig;
  exports.project = project;
  ready = true
}

exports.getConfig = function(cb) {
  if (exports.projectConfig) {
    cb(exports.projectConfig)
  } else {
    exports.loadConfig(cb)
  }
}

exports.loadConfig = function(cb) {

  if (!ready) throw new Error("Library must be initialized first")

  var projectLocation = exports.appConfig.directories.workspace + exports.project + '/';
  var projectSource = projectLocation + exports.appConfig.directories.makomi;
  var configFile = projectSource + exports.appConfig.files.makomi;

  fs.readFile(configFile,'utf-8',function (er, data) {

    // load and expand the config for the project
    // TODO: handle parsing errors
    var projectConfig = JSON.parse(data)
    projectConfig.location = projectLocation;
    projectConfig.source = projectSource;
    projectConfig.configFile = configFile;

    exports.projectConfig = projectConfig;
    cb(exports.projectConfig);

  });

}

exports.getRoutes = function(cb) {
  if (exports.routes) {
    cb(exports.routes)
  } else {
    exports.loadRoutes(cb)
  }
}

exports.loadRoutes = function(cb) {

  if (!ready) throw new Error("Library must be initialized first")

  // if project config is not loaded, load it and try again
  if (!exports.projectConfig) {
    exports.loadConfig(function() {
      exports.loadRoutes(cb)
    })
    return;
  }

  var routesFile = exports.projectConfig.source + exports.appConfig.files.routes;

  console.log("Routes file: " + routesFile)

  fs.readFile(routesFile,'utf-8',function (er, data) {

    // TODO: handle parse errors
    exports.routes = JSON.parse(data)
    cb(exports.routes)

  });


}