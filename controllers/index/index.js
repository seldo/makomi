var mkSrc = require('makomi-source-util'),
  fs = require('fs-extra'),
  core = require('./../../core.js');

/*
 * Load the project configuration, render the UI.
 */
module.exports = function (req, res) {

  var project = req.params.project
  sourceDir = mkSrc.config.getSync('workspace') + project + '/.makomi/';
  scratchDir = mkSrc.config.getSync('scratchpad') + project + '/'

  // load app definition, make it available to the rest of the app before rendering UI
  console.log("From controller/index: sourceDir sent as " + sourceDir)
  mkSrc.loadDefinition(sourceDir,function(appDefinition) {
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

  console.log("Defined sourceDir as " + sourceDir)
  if (sourceDirty) {
    core.generateApp();
  }

};