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

});


//Start server
var port =  process.env.PORT || 5000;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});

