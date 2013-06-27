/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function (req, res) {

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
  var appLocation = appConfig.workspace+req.session['project']+'/'

  console.log("Rendering route " + route + " method " + method + " data " + data);

  // call the rendering engine's render method
  // insert the editor JS into the output
  var rendered = renderer.render(
    appLocation,
    route,
    method,
    params,
    data,
    function (response) {
      // TODO: send status code and headers correctly too
      console.log(response.statusCode, 200);
      console.log(response.headers['content-type'], "text/html");

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