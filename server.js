/**
 * Import server/express modules
 * and setup the app specifications
 */ 
var express = require('express');
var favicon = require('express-favicon');
var path = require('path');
var jade = require("jade");
var app = express();

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'pics', 'favicon.ico')));

// compile file
var fileCompiler = jade.compileFile("jade/body.jade", { pretty: true });
/**
 * Set the HTTP GET request
 */ 

app.get('/', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/index.html');
});

app.get('/policymakers', function (req, res) {
    var html = fileCompiler({ activeTab: "policyMakers" });
    res.send(html);
});

app.get('/jobseekers', function (req, res) {
    var html = fileCompiler({ activeTab: "jobSeekers" });
    res.send(html);
});

app.listen('5055', function (req, res) {
    console.log('Dashboard listen at 5055');
});

