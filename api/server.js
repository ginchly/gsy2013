'use strict';
// Module dependencies.
var applicationRoot = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ), //Utilities for dealing with file paths
    url = require('url');
//Create server
var app = express();

var pg = require('pg').native, connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/gsy2013', client, query;

client = new pg.Client(connectionString);
client.connect();

// Configure server
app.configure( function() {

    //parses request body and populates request.body
    app.use( express.bodyParser() );

    //checks request.body for HTTP method overrides
    app.use( express.methodOverride() );

    // middleware must go above app router
    app.use(function(req, res, next) {
        var oneof = false;
        if(req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        // intercept OPTIONS method
        if (oneof && req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.send(200);
        }
        else {
            next();
        }
    });

    //perform route lookup based on url and HTTP method
    app.use( app.router );

    //Where to serve static content
    app.use('/app', express.static( path.join( applicationRoot, '../' ,'app') ));

    //Show all errors in development
    app.use( express.errorHandler({ dumpExceptions: true, showStack: true }));

    app.get('/api/:collection/:id', function(req, res) {
        console.log(req.params.collection);
        query = client.query('SELECT * FROM ' + req.params.collection + ' WHERE id = ' + req.params.id);
          query.on('row', function(result) {
            console.log(result);
            if (!result) {
                return res.send('No data found');
            } else {
                res.send(result);
            }
          });
    });

    app.get('/api/courses/:id/sessions', function(req, res) {
        var query = client.query('SELECT * FROM sessions WHERE course = ' + req.params.id);
        var rows = [];
        query.on('row', function(row) {
            //fired once for each row returned
            rows.push(row);
        });
        query.on('end', function() {
            //fired once and only once, after the last row has been returned and after all 'row' events are emitted
            //in this example, the 'rows' array now contains an ordered set of all the rows which we received from postgres
            res.json(rows);
        });
    });

    app.get('/api/understandScores', function(req, res) {
        //aggregate over concepts first
        // key by concept
        var query = client.query('SELECT concept, SUM(score) FROM understandScore GROUP BY concept;');
        var rows = {};
        query.on('row', function(row) {
            rows[row.concept] = row.sum;
        });
        query.on('end', function() {
            res.json(rows);
        });
    });

    app.get('/api/:concept/understandScores/plus', function(req, res) {
        var query = client.query("INSERT INTO understandScore (concept, score, time) VALUES ('" +  req.params.concept  + "', 1, '" + new Date().getTime() + "');");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.get('/api/:concept/understandScores/minus', function(req, res) {
        var query = client.query("INSERT INTO understandScore (concept, score, time) VALUES ('" +  req.params.concept  + "', -1, '" + new Date().getTime() + "');");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.get('/api/understandScores', function(req, res) {
        var query = client.query('SELECT name, concept, SUM(score) FROM concepts INNER JOIN understandScore ON concepts.id=understandScore.concept WHERE session = ' + req.params.id + ' GROUP BY name, concept');
        var rows = [];
        query.on('row', function(row) {
            //fired once for each row returned
            rows.push(row);
        });
        query.on('end', function() {
            //fired once and only once, after the last row has been returned and after all 'row' events are emitted
            //in this example, the 'rows' array now contains an ordered set of all the rows which we received from postgres
            res.json(rows);
        });
    });

    app.get('/api/sessions/:id/graphdata', function(req, res) {
        var query = client.query('SELECT score, time from understandscore INNER JOIN concepts ON concepts.id=understandscore.concept WHERE session = ' + req.params.id);
        var rows = [];
        rows[0] = ['time', 'score'];
        query.on('row', function(row) {
            //fired once for each row returned
            var thisRow = [parseFloat(row.time), row.score];
            rows.push(thisRow);
        });
        query.on('end', function() {
            //fired once and only once, after the last row has been returned and after all 'row' events are emitted
            //in this example, the 'rows' array now contains an ordered set of all the rows which we received from postgres
            res.json(rows);
        });
    });

    app.get('/api/courses', function(req, res) {
        var query = client.query('SELECT * FROM courses');
        var rows = [];
        query.on('row', function(row) {
            //fired once for each row returned
            rows.push(row);
        });
        query.on('end', function() {
            //fired once and only once, after the last row has been returned and after all 'row' events are emitted
            //in this example, the 'rows' array now contains an ordered set of all the rows which we received from postgres
            res.json(rows);
        });
    });

    app.get('/api/sessions/:id/concepts', function(req, res) {
        var query = client.query('SELECT * FROM concepts WHERE session = ' + req.params.id);
        var rows = [];
        query.on('row', function(row) {
            //fired once for each row returned
            rows.push(row);
        });
        query.on('end', function() {
            //fired once and only once, after the last row has been returned and after all 'row' events are emitted
            //in this example, the 'rows' array now contains an ordered set of all the rows which we received from postgres
            res.json(rows);
        });
    });


    app.post('/api/sessions/:id/concepts', function(req, res) {
        if(!req.body.hasOwnProperty('name')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }
        var query = client.query("INSERT INTO concepts (name, session) VALUES ('" +  req.body.name  + "', " + req.params.id + ");");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.post('/api/courses', function(req, res) {
        if(!req.body.hasOwnProperty('name')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }
        var query = client.query("INSERT INTO courses (name) VALUES ('" +  req.body.name  + "');");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.post('/api/courses/:id/sessions', function(req, res) {
        if(!req.body.hasOwnProperty('name')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }
        var query = client.query("INSERT INTO sessions (name, course) VALUES ('" +  req.body.name  + "', " + req.params.id + ");");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.post('/api/sessions/:id/transcript', function(req, res) {
        if(!req.body.hasOwnProperty('transcript')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }
        var query = client.query("INSERT INTO transcripts (transcript, session) VALUES ('" +  req.body.transcript  + "', " + req.params.id + ");");
        query.on('end', function() {
            res.json(true);
        });
    });

    app.get('/api/sessions/:id/transcripts', function(req, res) {
        var query = client.query('SELECT * FROM transcripts WHERE session = ' + req.params.id);
        var rows = [];
        query.on('row', function(row) {
            rows.push(row);
        });
        query.on('end', function() {
            res.json(rows);
        });
    });

    // Ability to delete sessions and concepts
    app.delete('/api/sessions/:id', function(req, res) {
        var query = client.query("DELETE FROM sessions WHERE id=" + req.params.id);
        query.on('end', function() {
            res.json(true);
        });
    });

    app.delete('/api/concepts/:id', function(req, res) {
        var query = client.query("DELETE FROM concepts WHERE id=" + req.params.id);
        query.on('end', function() {
            res.json(true);
        });
    });

});


//Start server
var port =  process.env.PORT || 5000;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});

