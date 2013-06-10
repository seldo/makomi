/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function(req, res){

  var route = req.query.route;

  console.log("app is " + app)
  console.log("Route is " + route);
  res.render('output-base')
};