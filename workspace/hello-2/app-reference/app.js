/**
 * GENERATED MAKOMI APP: hello-2
 * IF YOU EDIT THIS YOUR CHANGES WILL BE LOST WHEN YOU RECOMPILE
 */

var express = require('express'),
  http = require('http'),
  Cookies = require('cookies'),
  connect = require('connect'),
  path = require('path'),
  io = require('socket.io'),
  sio = require('socket.io-sessions'),
  MemoryStore = require('connect/lib/middleware/session/memory'),
  mkEx = require('makomi-express-runtime'),
  mkSrc = require('makomi-source-util');

// boot express
var app = express();

// configure express
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

// standard middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// load application-level config once per node
var appConfigFile = process.env.MAKOMICONF || '/etc/makomi/makomi.conf'
mkSrc.config.setConfigFileLocation(appConfigFile);
mkSrc.config.setEnv(process.env.MAKOMIENV);

// everything in here waits until config is available
mkSrc.config.loadConfig(function(config) {

  // sessions
  var sessionStore = new MemoryStore;
  app.use(express.cookieParser());
  app.use(express.session({
    secret: mkSrc.config.getSync('sessions.secret'),
    store: sessionStore
  }));

  // router
  app.use(app.router);
  require('./router.js')(app);

  // stylesheets and static content
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));

  // dev-only middleware
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  // set up persistent connections to datasources, if required
  mkEx.datasources.load(function(datasources) {

    // start the server
    var server = http.createServer(app).listen(app.get('port'), function(){
      console.log('hello-2 listening on port ' + app.get('port'));
    });

    // start websocket support (sorry, socket.io's magic, not mine)
    var socketServer = io.listen(server,{log: false})
    var sessionSocketServer = sio.enable({
      socket: socketServer,
      store:  sessionStore,
      parser: connect.cookieParser()
    });
    mkEx.sockets.start(socketServer,__dirname)

  })

});
