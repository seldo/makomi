module.exports = function(app){
  var routes = require('./routes')
      , user = require('./routes/user');

  app.get('/', routes.index);
  app.get('/users', user.list);
}