
/**
 * Module dependencies.
 */
var express = require('express'),
    http = require('http'),
    connect = require('connect'),
    io = require('socket.io'),
    sio = require('socket.io-sessions'),
    path = require('path'),
    Cookies = require('cookies'),
    socketController = require('./controllers/sockets');

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
var MemoryStore = require('connect/lib/middleware/session/memory');
var sessionStore = new MemoryStore;
app.use(express.cookieParser());
app.use(express.session({
  secret: appConfig.sessions.secret,
  store: sessionStore
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

// start the server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server with Socket.io listening on port ' + app.get('port'));
});

// tell Socket.io to listen to the server, too.
// If you don't do it this way, socket takes over all HTTP requests.
// It is not at all obvious to me why this works.
var socketServer = io.listen(server)

// set up the socket listeners, with session support
var sessionSocketServer = sio.enable({
  socket: socketServer,         // Socket.IO listener
  store:  sessionStore,                // Your session store
  parser: connect.cookieParser()  // Cookie parser
});
socketController.start(socketServer)
