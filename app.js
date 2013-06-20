
/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    path = require('path'),
    Cookies = require('cookies');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// app-wide config loaded once per thread
// FIXME: configs should be loaded from outside the app, never checked in
appConfig = {
  directories: {
    workspace: __dirname + '/workspace/',
    makomi: '.makomi/'
  },
  files: {
    makomi: 'makomi.json',
    routes: 'routes.json'
  },
  sessions: {
    key: 'mks',
    secret: 'some secret key here'
  }
}

// sessions
app.use(express.cookieParser());
app.use(express.cookieParser(appConfig.sessions.secret));
app.use(express.cookieSession({
  secret: appConfig.sessions.secret
}));

// define routes in their own file because that seems better
app.use(app.router);
require('./router.js')(app);

app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
