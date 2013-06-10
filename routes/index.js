/*
 * Load the project configuration, render the UI.
 */
exports.index = function(req, res){
  var project = req.params.project

  // load project config, make it available to the rest of the app before rendering UI
  // TODO: should read <project>/.makomi/makomi.json, hard-coding for now
  config = {
      "project": "hello-2",           // name of this project
      "engines": {
          "generator": "makomi-express",  // module to use to create this project (TODO)
          "renderer": "makomi-express"    // module to use to render views
      }
  }

  appState = {};
  appState.renderer = require(config.engines.renderer);

  // now render the UI
  res.render('index', { title: 'Express', project: project });
};