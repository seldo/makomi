/**
 * All routing rules in one place, sort of.
 * I'm not really clear on the Express-y way to do this.
 */

module.exports = function(app){
  var routes = require('./routes')
      , user = require('./routes/user');

  app.get('/', routes.index);
  app.get('/users', user.list);
}