var mkUtil = require('makomi-source-util');

/*
 * Load the project configuration, render the UI.
 */
module.exports = function (req, res) {

  var project = req.params.project

  // load app definition, make it available to the rest of the app before rendering UI
  var sourceDir = appConfig.workspace+project+'/.makomi/';
  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    // give it to everybody else
    req.session['definition'] = appDefinition
    req.session['project'] = project
    req.session['sourceDir'] = sourceDir
    res.render('index', {
      title: appDefinition.project + " | Makomi",
      project: project });
  });

};