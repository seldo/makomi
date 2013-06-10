module.exports = function(app){

  var routes = require('./routes')
    , context = require('./routes/context')
    , output = require('./routes/output')
    , toolbox = require('./routes/toolbox')

  app.get('/:project', routes.index);
  app.get('/:project/context', context.dom);
  app.get('/:project/output',  output.base);
  app.get('/:project/toolbox', toolbox.base);

}