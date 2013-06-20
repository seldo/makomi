var fs = require('fs')

/*
 * Load the project configuration, render the UI.
 */
exports.index = function (req, res) {

  console.log("Index requested")

  var project = req.params.project

  // load project config, make it available to the rest of the app before rendering UI
  // TODO: this should probably happen when you select/load a project, not just by URL maybe?
  var projectLocation = config.directories.workspace + project + '/';
  var projectSource = projectLocation + config.directories.makomi;
  var configFile = projectSource + config.files.makomi;
  console.log(configFile);
  fs.readFile(configFile,'utf-8',function (er, data) {
    console.log(data)
    // TODO: handle parsing errors
    var projectConfig = JSON.parse(data)

    projectConfig.location = projectLocation;
    projectConfig.source = projectSource;
    projectConfig.configFile = configFile;

    // give it to everybody else
    req.session['config'] = projectConfig
    res.render('index', { title: 'Express', project: project });
  });

};