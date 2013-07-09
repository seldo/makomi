/*
 * The meta-structure of the templates for the current route
 * (not an actual DOM view)
 */

var MC = require('emcee'),
  mkRun = require('makomi-express-runtime'),
  routesModel = require('../../models/makomi-routes'),
  sessionsModel = require('../../models/sessions');

module.exports = function(req, res) {

  var m = new MC();
  m.load('sessions', req, appConfig)
  m.end(function(er,models) {

    var layout = {
      source: "layouts/default",
      context: {
        "title": "DOM tab",
        "project": models['sessions'].project
      },
      templates: {
        "body": {
          source: "context/dom",
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