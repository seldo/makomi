/*
 * Rendering of the current view, plus our code to allow manipulation.
 */

exports.base = function(req, res){

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;
  var data = JSON.parse(req.query.data);

  // do stuff in our session
  // FIXME: is there a nicer way to lay this out than inside a callback block?
  req.session.get('config',function(er,config) {
      console.log("Config is ");
      console.log(config);
      var renderer = require(config.engines.renderer);
      var appLocation = config.location;

      console.log("Rendering engine is " + renderer.name)
      console.log("Rendering route " + route + " method " + method + " data " + data);

      var rendered = renderer.render(appLocation,route,method,params,data,function(response){
          // TODO: send status code and headers correctly too
          console.log(response.statusCode, 200);
          console.log(response.headers['content-type'], "text/html");

          // TODO: we should probably parse this and insert it rather than relying on browsers
          var modifiedBody = response.body +
              '<script src="/javascripts/editor.js"></script>';
          res.send(modifiedBody)
      })
  });
};