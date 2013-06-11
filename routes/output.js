/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function(req, res){

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = JSON.parse(req.query.data);

  var config = req.session.get('config',function(er,config) {
      console.log("Config is ");
      console.log(config);
      var renderer = require(config.engines.renderer);
      var appLocation = config.location;

      console.log("Rendering engine is " + renderer.name)
      console.log("Rendering route " + route + " method " + method + " data " + data);

      var rendered = renderer.render(appLocation,route,method,params,data,function(response){
          // response is the response from hitting '/'
          console.log(response.statusCode, 200);
          console.log(response.headers['content-type'], "text/html");
          res.send(response.body)
      })
  });
};