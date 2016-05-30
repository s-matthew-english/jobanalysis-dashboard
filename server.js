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

/**
 * Container for skill search.
 */ 
var skills = undefined;

/**
 * Set the HTTP GET request
 */ 

app.get('/', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/index.html');
});

app.get('/policymakers', function (req, res) {
    skills = req.query.q;
    console.log(skills);
    // compile file
    var fileCompiler = jade.compileFile("jade/body.jade", { pretty: true });
    var html = fileCompiler({ activeTab: "PolicyMakers" });
    res.send(html);
});

app.get('/jobseekers', function (req, res) {
    skills = req.query.q;
    console.log(skills);
    // compile file
    var fileCompiler = jade.compileFile("jade/body.jade", { pretty: true });
    var html = fileCompiler({ activeTab: "JobSeekers" });
    res.send(html);
});

// sends the skill names to the input
app.post('/fill-searchbar', function (req, res) {
    console.log("Skills:", skills);
    res.send(skills);
})



app.listen('2409', function (req, res) {
    console.log('Dashboard listen at 2409');
});

