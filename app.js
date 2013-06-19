
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , RedSess = require('redsess')
  , Cookies = require('cookies')
  , Keygrip = require('keygrip');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
//app.register('.hbs', require('handlebars'));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// app-wide config loaded once per thread
// TODO: get this from a file or something
var config = {
    // TODO: use these
    keys: ['some secret keys here']
}

// session management "middleware"
RedSess.createClient();
app.use(function(req,res,next) {
    var session = new RedSess(req, res, {
        cookieName: "s"
    })
    req.session = res.session = session

    console.log("Session connected")
    next();
});

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
