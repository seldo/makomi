/*
 * Data sources: adapters, connections and queries
 */

var MC = require('emcee'),
  mkRun = require('makomi-express-runtime'),
  sessionsModel = require('../../models/sessions'),
  adaptersModel = require('../../models/adapters'),
  connectionsModel = require('../../models/connections');

module.exports = function(req, res) {

  var m = new MC();
  m.load('sessions', req, appConfig)
  m.end(function(er,models) {

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Datasources tab",
        "adapters": models['adapters'],
        "connections": models['connections']
      },
      templates: {
        "body": {
          source: "context/datasources",
          context: {}
        }
      }
    }

    mkRun.compile(layout,function(renderedView) {
      res.send(renderedView)
    });
  })

};