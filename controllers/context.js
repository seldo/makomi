/*
 * What am I looking at right now?
 */

var mkUtil = require('makomi-source-util'),
    hb = require('handlebars'),
    mkRun = require('makomi-express-runtime');

exports.dom = function(req, res) {

  mkUtil.init(appConfig,req.session.project)
  mkUtil.getRoutes(function(routes) {

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Context pane",
        "routes": routes
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

  });
};