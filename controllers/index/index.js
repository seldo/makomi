var mkUtil = require('makomi-source-util'),
  fs = require('fs-extra'),
  util = require('util');

/*
 * Load the project configuration, render the UI.
 */
module.exports = function (req, res) {

  var project = req.params.project

  // load app definition, make it available to the rest of the app before rendering UI
  var sourceDir = appConfig.workspace+project+'/.makomi/';
  var scratchDir = appConfig.scratchpad + project + '/'
  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    // give it to everybody else
    req.session['definition'] = appDefinition
    req.session['project'] = project
    req.session['scratchDir'] = scratchDir
    req.session['sourceDir'] = sourceDir
    // FIXME: this concatenation is repeated in makomi-source-util
    req.session['applocation'] = scratchDir + 'app/'
    res.render('index', {
      title: appDefinition.project + " | Makomi",
      project: project });
  });



};