/**
 * Import server/express modules
 * and setup the app specifications
 */
var express = require('express'),
    favicon = require('express-favicon'),
    path    = require('path'),
    pug     = require("pug");
var app = express();

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'pics', 'favicon.ico')));

/**
 * Set the HTTP GET request
 */

app.get('/', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/index.html');
});

app.get('/policymakers', function (req, res) {
    // compile file
    var fileCompiler = pug.compileFile("jade/body.jade", { pretty: true });
    var html = fileCompiler({ activeTab: "PolicyMakers" });
    res.send(html);
});

app.get('/jobseekers', function (req, res) {
    // compile file
    var fileCompiler = pug.compileFile("jade/body.jade", { pretty: true });
    var html = fileCompiler({ activeTab: "JobSeekers" });
    res.send(html);
});


app.listen('2409', function (req, res) {
    console.log('Dashboard listen at 2409');
});

