/*
 * What am I looking at right now?
 */

var MC = require('emcee'),
    mkRun = require('makomi-express-runtime'),
    routesModel = require('../../models/makomi-routes'),
    sessionsModel = require('../../models/sessions');

module.exports = function(req, res) {

  var m = new MC();
  m.load('sessions', req, appConfig)
  m.end(function(er,models) {

    console.log("Rendering context index")
    console.log("Sessions says ")
    console.log(models['sessions'])

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Context pane",
        "project": models['sessions'].project
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