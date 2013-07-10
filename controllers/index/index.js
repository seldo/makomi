var mkUtil = require('makomi-source-util'),
  fs = require('fs-extra');

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
      mkUtil.generateWorkingCopy(appDefinition,sourceDir,scratchDir, function(fileMap,idMap) {

        socketServer.on('sconnection', function (client,session) {

          // when the connection is detected, send the sourcemap
          // FIXME: if the connection isn't from the DOM pane, it could miss this message
          console.log("Sourcemaps ready to go")
          socketServer.sockets.emit('sourcemap-ready', {
            "fileMap": fileMap,
            "idMap": idMap
          })

        })

      })
    })
  })


};