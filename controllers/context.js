/*
 * What am I looking at right now?
 */

var mkUtil = require('makomi-source-util'),
    hb = require('handlebars'),
    mkPre = require('makomi-template-precompiler');

exports.dom = function(req, res) {

  mkUtil.init(appConfig,req.session.project)
  mkUtil.getRoutes(function(routes) {

    var renderFragment = function(source,context) {
      var template = hb.compile(source);
      return template(context)
    }

    var layout = {
      source: "layouts/default",
      context: {
        "title": "Context pane",
        "routes": routes
      },
      templates: {
        "body": {
          source: "context/routes"
        }
      }
    }

    mkPre.compile(layout,renderFragment,function(renderedView) {
      res.send(renderedView)
    });

  });
};