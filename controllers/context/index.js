/*
 * Context pane: what am I looking at right now?
 */

var MC = require('emcee'),
    mkRun = require('makomi-express-runtime'),
    routesModel = require('../../models/makomi-routes'),
    sessionsModel = require('../../models/sessions');

module.exports = function(req, res) {

  var m = new MC();
  m.load('sessions', req)
  m.end(function(er,models) {

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Context pane",
        "project": models['sessions'].project,
        "styles": "<link rel='stylesheet' href='/stylesheets/context/index.css' />"
      },
      templates: {
        "body": {
          source: "context/index"
        }
      }
    }

    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
  })

};