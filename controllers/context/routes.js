/*
 * What am I looking at right now?
 */

var MC = require('emcee'),
    mkRun = require('makomi-express-runtime'),
    routesModel = require('../../models/makomi-routes'),
    sessionsModel = require('../../models/sessions');

module.exports = function(req, res) {

  var m = new MC();
  m.load('makomi-routes', req)
  m.load('sessions', req)
  m.end(function(er,models) {

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Routes tab",
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