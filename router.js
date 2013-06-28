module.exports = function(app){

  var index = require('./controllers/index/_actions')
    , context = require('./controllers/context/_actions')
    , output = require('./controllers/output/_actions')
    , toolbox = require('./controllers/toolbox/_actions')

  app.get('/:project', index.index);
  app.get('/:project/context', context.dom);
  app.get('/:project/output',  output.base);
  app.get('/:project/toolbox', toolbox.base);

}