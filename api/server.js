'use strict';
// Module dependencies.
var applicationRoot = __dirname,
    express = require( 'express' ), //Web framework
    path = require( 'path' ); //Utilities for dealing with file paths
//Create server
var app = express();

var teacherInfo = [{ name: 'Mr Teacher 1', score: 15, allowComments: true},
{ name: 'Mr Teacher 2', score: 15, allowComments: true}];

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

    app.get('/teacher/:id', function(req, res) {
        res.json(teacherInfo[req.params.id]);
    });

    app.get('/teachers', function(req, res) {
      res.json(teacherInfo);
    });

});


//Start server
var port =  process.env.PORT || 5000;
app.listen( port, function() {
    console.log( 'Express server listening on port %d in %s mode', port, app.settings.env );
});

