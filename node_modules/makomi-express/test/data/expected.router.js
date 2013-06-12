// AUTOMATICALLY GENERATED. DO NOT EDIT.
// The droid you're looking for is .makomi/routes.json
module.exports = function(app){
  var index = require('./controllers/index')
    , users = require('./controllers/users');
  app.get('/', index.index);
  app.get('/users', users.list);
}
