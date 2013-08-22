// Front page

// AUTOMATICALLY GENERATED. DO NOT EDIT (yet).
// The droid you're looking for is .makomi/controllers/index/index.json
// Some day, we'll allow you to edit this file and import changes back to the source.

var MC = require('emcee'),
  mkRun = require('makomi-express-runtime');

module.exports = function(req, res) {

  // load models, then do stuff
  var m = new MC();
  m.end(function(er,models) {

    // define the data that will be passed to the view engine
    var layout = {
      "source": "layout",
      "context": {
        "title": "Slightly more complicated than Hello, World"
      },
      "templates": {
        "col1": {
          "source": "welcome",
          "context": {}
        },
        "col2": {
          "source": "index",
          "context": {}
        },
        "col3": {
          "source": "welcome",
          "context": {}
        }
      }
    };

    // call the view engine
    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
  });

};
