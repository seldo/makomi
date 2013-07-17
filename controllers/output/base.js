var mkUtil = require('makomi-source-util'),
  mkRun = require('makomi-express-runtime'),
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

  // if the app's not generated yet, wait until it is
  if(!fileMap || !idMap) {
    var layout = {
      source: "layouts/default",
      templates: {
        "body": {
          "source": "try-again"
        }
      }
    }
    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
    return;
  }

  // get rendering parameters from the config
  var projectConfig = req.session['definition']
  var renderer = require(projectConfig.renderer);
  var sourceDir = req.session['sourceDir']
  var scratchDir = req.session['scratchDir']
  var appLocation = req.session['applocation']

  console.log("Rendering route " + route + " method " + method + " data " + data);

  // chrome caches this shit and that's annoying
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

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

};