/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function (req, res) {

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = JSON.parse(req.query.data);

  // do stuff in our session
  var projectConfig = req.session.config
  console.log("Config is ");
  console.log(projectConfig);
  var renderer = require(projectConfig.renderer);
  var appLocation = projectConfig.location;

  console.log("Rendering engine is " + renderer.name)
  console.log("Rendering route " + route + " method " + method + " data " + data);

  console.log(renderer);

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
        '<script src="/javascripts/editor.js"></script>';
      res.send(modifiedBody)
    }
  )

};