var mkUtil = require('makomi-source-util'),
  fs = require('fs-extra'),
  util = require('util');

/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

module.exports = function (req, res) {

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = {}
  if (req.query.data) {
    data = JSON.parse(req.query.data);
  }

  // get rendering parameters from the config
  var projectConfig = req.session['definition']
  var renderer = require(projectConfig.renderer);
  var sourceDir = req.session['sourceDir']
  var scratchDir = req.session['scratchDir']
  var appLocation = req.session['applocation']

  // separately, ID-ify the source code and generate the working copy of the app
  // yeah, we're loading the definition twice, here and above. Suck it.
  mkUtil.loadDefinition(sourceDir,function(appDefinition) {
    fs.mkdirs(scratchDir,function() {
      mkUtil.generateWorkingCopy(appDefinition,sourceDir,scratchDir, function(newFileMap,newIdMap) {
        // pass the data to the app in general
        fileMap = newFileMap
        idMap = newIdMap

        console.log("Rendering route " + route + " method " + method + " data " + data);

        // call the rendering engine's render method
        // insert the editor JS into the output
        var rendered = renderer.render(
          sourceDir,
          appLocation,
          route,
          method,
          params,
          data,
          function (response) {

            // give the controller to the app
            socketServer.on('sconnection', function (client,session) {
              console.log("Controller sent")
              socketServer.sockets.emit('controller-ready', {
                controller: response.controller
              })
            })

            // TODO: send status code and headers correctly too
            // response.statusCode, 200
            // response.headers['content-type'], "text/html"

            // TODO: we should probably parse this and insert it
            // rather than generating crappy HTML.
            var modifiedBody = response.body +
              '<script src="/javascripts/jquery-1.10.1.min.js"></script>' +
              '<script src="/socket.io/socket.io.js"></script>' +
              '<script src="/socket.io/socket.io-sessions.js"></script>' +
              '<script src="/javascripts/editor.js"></script>';

            res.send(modifiedBody)

          }
        )

      })
    })
  })



};