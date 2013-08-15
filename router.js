module.exports = function(app){

  var index = require('./controllers/index/_actions')
    , context = require('./controllers/context/_actions')
    , output = require('./controllers/output/_actions')
    , toolbox = require('./controllers/toolbox/_actions')

  app.get('/:project', index.index);
  app.get('/:project/context', context.index);
  app.get('/:project/context/routes', context.routes);
  app.get('/:project/context/dom', context.dom);
  app.get('/:project/context/datasources', context.datasources);
  app.get('/:project/output',  output.editor);
  app.get('/output/editorcss',  output.editorcss);
  app.get('/:project/toolbox', toolbox.base);

}