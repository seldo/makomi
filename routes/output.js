/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function(req, res){

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = JSON.parse(req.query.data);

  var renderer = appState.renderer;

  console.log("Rendering engine is " + renderer.name)
  console.log("Rendering route " + route + " method " + method + " data " + data);

  res.send(renderer.render(route,method,params,data))
};