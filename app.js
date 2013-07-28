
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
  mkEx = require('makomi-express-runtime'),
  MemoryStore = require('connect/lib/middleware/session/memory'),
  browserify = require('browserify-middleware');

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
var appConfigFile = process.env.MAKOMICONF || '/etc/makomi/makomi.conf'
// these are app-wide, read-only data structures
// TODO: is it rational to want to wrap these in something? Is that not node-y?
appConfig = {}
sourceDir = null
scratchDir = null
socketServer = null
sourceDirty = true
generating = false
fileMap = null
idMap = null

mkEx.util.loadConfig(appConfigFile,function(config) {

  appConfig = config;

  app.use(express.cookieParser());

  // session store
  var sessionStore = new MemoryStore;

  // FIXME: is this actually sufficient to set a secret?
  // Does it also need to be passed to the cookieParser?
  app.use(express.session({
    secret: appConfig.sessions.secret,
    store: sessionStore
  }));

  // define routes in their own file because that seems better
  app.use(app.router);
  require('./router.js')(app);

  // browserified consolidated scripts. TODO: generalize, refactor this.
  app.use('/js', browserify('./public/javascripts'));
  app.get('/js/dom.js', browserify('./public/javascripts/dom.js'));
  app.get('/js/editor.js', browserify('./public/javascripts/editor.js'));

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
  socketServer = io.listen(server,{log: false})

  // set up the socket listeners, with session support
  var sessionSocketServer = sio.enable({
    socket: socketServer,         // Socket.IO listener
    store:  sessionStore,                // Your session store
    parser: connect.cookieParser()  // Cookie parser
  });
  // TODO: socket actions should be handled by regular controllers
  var socketController = require('./controllers/sockets.js')
  socketController.start(socketServer)
  //mkEx.misc.socketController.start(socketServer)

})
