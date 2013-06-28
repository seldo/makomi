/*
 * What am I looking at right now?
 */

var MC = require('emcee'),
    hb = require('handlebars'),
    mkRun = require('makomi-express-runtime'),
    modelRoutes = require('../../models/makomi-routes');

module.exports = function(req, res) {

  var session = req.session;
  console.log(session);

  var m = new MC();
  m.load('makomi-routes', req, appConfig)
  m.end(function(er,models) {

    console.log(models['makomi-routes'])

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Context pane",
        "routes": models['makomi-routes']
      },
      templates: {
        "body": {
          source: "context/routes",
          context: {
            "where": "the DOM"
          }
        }
      }
    }

    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
  })

};