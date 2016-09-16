'use strict';

/**
 * Import server/express modules and
 * setup the app specifications
 */
var express = require('express'),
    request = require('request'),
    querystring = require('querystring'),
    favicon = require('express-favicon'),
    path = require('path'),
    pug = require("pug");

var app = express();

app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'pics', 'favicon.ico')));

/////////////////////////////////////////////////
// Server websites routing

app.get('/', function(req, res) {
    var htmlPath = path.join(__dirname, 'public', 'html');
    res.sendFile(htmlPath + '/index.html');
});

//TODO move fileCompiler out of the get requests

app.get('/policymakers', function(req, res) {
    // compile file
    var fileCompiler = pug.compileFile("jade/body.jade", {
        pretty: true
    });
    var html = fileCompiler({
        activeTab: "PolicyMakers"
    });
    res.send(html);
});

app.get('/jobseekers', function(req, res) {
    // compile file
    var fileCompiler = pug.compileFile("jade/body.jade", {
        pretty: true
    });
    var html = fileCompiler({
        activeTab: "JobSeekers"
    });
    res.send(html);
});

/////////////////////////////////////////////////
// Server routing and methods


var helper = require("./app/helper");

var DATAPORT = process.env.npm_package_config_datahost;

app.get('/data/init/statistics', function(req, res) {
    var options = {
        url: DATAPORT + '/api/v1/stats/count',
    };
    request(options, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            var info = JSON.parse(body);
            res.send(info);
        }
    });
});

app.get('/data/init/top-lists', function(req, res) {
    var options = {
        url: DATAPORT + '/api/v1/stats/lists',
    };
    request(options, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            var info = JSON.parse(body);
            res.send(info);
        } else {
            res.send({ error: "Unable to load auto" });
        }
    });
});

app.get('/data/init/top-lists/:length', function(req, res) {
    var length = req.params.length;
    var options = {
        url: DATAPORT + '/api/v1/stats/lists/' + length,
    };
    request(options, function(err, response, body) {
        if (!err && response.statusCode === 200) {
            var info = JSON.parse(body);
            res.send(info);
        }
    });
});

app.get('/data/jobposts', function(req, res) {

    var query = {};
    if (req.query.q) {
        query.skills = req.query.q;
    }
    if (req.query.l) {
        var locations, countries;
        if (req.query.l instanceof Array) {
            locations = req.query.l.filter(function(loc) {
                return helper.EUCountries.indexOf(loc) === -1;
            });
            countries = req.query.l.filter(function(loc) {
                return helper.EUCountries.indexOf(loc) !== -1;
            });
            if (locations.length !== 0) {
                query.locations = locations;
            }
            if (countries.length !== 0) {
                query.countries = countries;
            }
        } else {
            var loc = req.query.l;
            if (helper.EUCountries.indexOf(loc) === -1) {
                query.locations = [loc];
            } else {
                query.countries = [loc];
            }
        }
    }

    var queryString = querystring.stringify(query);
    var options = {
        url: DATAPORT + '/api/v1/jobs?' + queryString,
    };
    request(options, function(err, response, body) {
        var info = JSON.parse(body);
        if (!err && response.statusCode === 200) {
            res.send(info);
        } else {
            res.send(info);
        }
    });
});

// run the server
var PORT = process.env.npm_package_config_port;
app.listen(PORT, function(req, res) {
    console.log('Dashboard listen at', PORT);
});
