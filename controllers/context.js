/*
 * What am I looking at right now?
 */

var MC = require('emcee'),
    hb = require('handlebars'),
    mkRun = require('makomi-express-runtime'),
    modelRoutes = require(process.cwd() + '/models/makomi-routes');

exports.dom = function(req, res) {

  var m = new MC();
  m.load('makomi-routes', req, appConfig)
  m.end(function(er,models) {

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