/**
 * All routing rules in one place, sort of.
 * I'm not really clear on the Express-y way to do this.
 */

module.exports = function(app){
  var index = require('./controllers/index')
    , user = require('./controllers/user');

  app.get('/', index.index);
  app.get('/users', user.list);
}