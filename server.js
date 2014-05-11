var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var settings = require('./settings');

var app = express();
//all environments
app.set('port', process.env.PORT || settings.web.port);
//app.use(express.bodyParser({uploadDir: path.join(__dirname, 'public/uploads')}));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/')));
app.set('views', path.join(__dirname, 'public/themes'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.web.cookieSecret
}));

app.use(app.router);
routes(app);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});