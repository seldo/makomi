/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function(req, res){

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = JSON.parse(req.query.data);

  var config = req.session.get('config',function(er,configString) {
      console.log("config string: ");
      console.log(configString)
      //var config = JSON.parse(configString);
      var config = configString;
      console.log("Config is ");
      console.log(config);
      var renderer = require(config.engines.renderer);
      var appLocation = config.location;

      console.log("Rendering engine is " + renderer.name)
      console.log("Rendering route " + route + " method " + method + " data " + data);

      var rendered = renderer.render(appLocation,route,method,params,data)
      console.log('rendered is ' + rendered)
      res.send(rendered)
  });
};