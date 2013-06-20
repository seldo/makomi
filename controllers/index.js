var fs = require('fs')

/*
 * Load the project configuration, render the UI.
 */
exports.index = function(req, res){

  console.log("Index requested")

  var project = req.params.project

  // load project config, make it available to the rest of the app before rendering UI
  // TODO: this should probably happen when you select/load a project, not just by URL maybe?
  // TODO: should read <project>/.makomi/makomi.json, hard-coding for now
  var config = {
      "project": "hello-2",
      "sessionTest": "test-" + Math.random() // changes every time we reload the project
  };
  config.engines = {
      "generator": "makomi-express",  // module to use to create this project (TODO)
      "renderer": "makomi-express"    // module to use to render views
  }
  // FIXME: working directory should be configurable
  config.location = process.cwd() + "/workspace/" + config.project + "/"

  // give it to everybody else
  req.session['config'] = config
  res.render('index', { title: 'Express', project: project });

};