// User list

// AUTOMATICALLY GENERATED. DO NOT EDIT (yet).
// The droid you're looking for is .makomi/controllers/users/list.json
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
        "title": "List of users"
      },
      "templates": {
        "col2": {
          "source": "users/list",
          "context": {
            "users": {
              "type": "query",
              "value": "users/list"
            }
          }
        }
      }
    };

    // call the view engine
    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
  });

};
