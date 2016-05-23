/**
 * Import server/express modules
 * and setup the app specifications
 */ 
var express = require('express');
var favicon = require('express-favicon');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'pics', 'favicon.ico')));


/**
 * Import QMiner module and initialize the database
 */ 

//var base = new qm.Base({
//    mode: 'openReadOnly',
//    dbPath: './data/database/'
//});



/**
 * Set the HTTP GET request
 */ 

app.get('/', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/index.html');
});

app.get('/policymakers', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/policymakers.html');
});

app.get('/jobseekers', function (req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/jobseekers.html');
});

app.listen('5055', function (req, res) {
    console.log('Dashboard listen at 5055');
});

