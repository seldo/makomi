var mkRun = require('makomi-express-runtime'),
  mkSrc = require('makomi-source-util'),
  fs = require('fs-extra'),
  util = require('util'),
  core = require('../../core.js');

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
  if(sourceDirty) {
    core.generateApp();
    console.log("Output not ready; try again")
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

  console.log("Editor: rendering route " + route + " method " + method + " data " + data);

  // call the rendering engine's render method
  // insert the editor JS into the output
  var rendered = renderer.render(res,
    sourceDir,
    appLocation,
    route,
    method,
    params,
    data,
    function (response) {

      // send headers and prevent caching
      res.status(response.statusCode)
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.header('Content-type',response.headers['Content-type'])

      // tell the client the controller is ready
      socketServer.on('sconnection', function (client,session) {
        socketServer.sockets.emit('controller-ready', {
          controller: response.controller
        })
      })

      var modifiedBody = response.body.replace(
        '</head>',
        '<link rel="stylesheet" href="/output/editorcss"/></head>'
      )

      modifiedBody = modifiedBody.replace(
        '</body>',
        '<script src="/socket.io/socket.io.js"></script>' +
        '<script src="/socket.io/socket.io-sessions.js"></script>' +
        '<script src="/js/editor.js"></script>' +
        '</body>'
      );

      res.send(modifiedBody)

    }
  )

  var findTagByName = function(dom,name) {
    var tagToFind = false;
    dom.every(function(element,index) {
      if (element.type == 'tag' && element.name == name) {
        tagToFind = element
        return false;
      }
      return true;
    })
    return tagToFind;
  }

};