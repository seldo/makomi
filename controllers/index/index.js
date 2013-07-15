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

  // separately, ID-ify the source code and generate the working copy of the app
  // yeah, we're loading the definition twice, here and above. Suck it.
  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    fs.mkdirs(scratchDir,function() {
      mkUtil.generateWorkingCopy(appDefinition,sourceDir,scratchDir, function(newFileMap,newIdMap) {
        // pass the data to the app in general
        fileMap = newFileMap
        idMap = newIdMap
      },true) // means dev-mode
    })
  })


};