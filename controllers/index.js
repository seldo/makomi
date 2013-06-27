var mkUtil = require('makomi-source-util');

/*
 * Load the project configuration, render the UI.
 */
exports.index = function (req, res) {

  var project = req.params.project

  // load app definition, make it available to the rest of the app before rendering UI
  mkUtil.loadDefinition(appConfig.workspace+project,function(appDefinition) {
    // give it to everybody else
    req.session['definition'] = appDefinition
    req.session['project'] = project
    res.render('index', {
      title: appDefinition.project + " | Makomi",
      project: project });
  });

};