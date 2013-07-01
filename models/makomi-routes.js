var MC = require('emcee'),
    mkUtil = require('makomi-source-util');

// define the makomi-routes model for MC
MC.model('makomi-routes', function (req, appConfig, cb) {

  mkUtil.loadRoutes(req.session['sourceDir'],function(routes) {
    // TODO: should pass any errors as first arg
    cb(null,routes)
  });

});