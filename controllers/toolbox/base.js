var mkRun = require('makomi-express-runtime'),
  fs = require('fs-extra'),
  util = require('util');

/*
 * Available functionality, native and from plugins
 */

module.exports = function(req, res){

  var layout = {
    source: "layouts/default",
    context: {
      "title": "Toolbox",
      "styles": "<link rel='stylesheet' href='/stylesheets/toolbox/base.css' />"
    },
    templates: {
      "body": {
        "source": "toolbox/index"
      }
    }
  }
  mkRun.compile(layout,function(renderedView) {
    res.send(renderedView)
  });

};