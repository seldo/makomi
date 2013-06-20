var mkUtil = require('makomi-source-util');

/*
 * Load the project configuration, render the UI.
 */
exports.index = function (req, res) {

  var project = req.params.project

  // load project config, make it available to the rest of the app before rendering UI
  mkUtil.init(appConfig,project)
  mkUtil.getConfig(function(projectConfig) {
    // give it to everybody else
    req.session['config'] = projectConfig
    req.session['project'] = project
    res.render('index', {
      title: projectConfig.project + " | Makomi",
      project: project });
  });

};