var MC = require('emcee'),
    mkUtil = require('makomi-source-util');

// define the makomi-routes model for MC
MC.model('makomi-routes', function (req, appConfig, cb) {

  var routesPath = appConfig.workspace+req.session['project']

  mkUtil.loadRoutes(routesPath,function(routes) {
    // TODO: should pass any errors as first arg
    cb(null,routes)
  });

});