/*
 * The meta-structure of the templates for the current route
 * (not an actual DOM view)
 */

var MC = require('emcee'),
  mkRun = require('makomi-express-runtime'),
  routesModel = require('../../models/makomi-routes'),
  sessionsModel = require('../../models/sessions');

module.exports = function(req, res) {

  var route = req.query.route;
  var method = req.query.method;
  var params = req.query.params;

  var m = new MC();
  m.load('sessions', req, appConfig)
  m.end(function(er,models) {

    // if the app's not generated yet, wait until it is
    if(!fileMap || !idMap) {
      var layout = {
        source: "layouts/default",
        templates: {
          "body": {
            "source": "try-again"
          }
        }
      }
      mkRun.compile(layout,function(renderedView) {
        res.send(renderedView)
      });
      return;
    }

    //
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