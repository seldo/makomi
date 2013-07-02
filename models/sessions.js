var MC = require('emcee');

// define the sessions model for MC
// We could just use req.session directly but we're trying to be consistent
MC.model('sessions', function (req, appConfig, cb) {

  cb(null,req.session)

});