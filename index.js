/**
A simple service to store HTTP request header fields in MySQL DB for network traffic analysis

@Date: 09/04/2017
*/

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var _ = require('lodash');

const connectionConfig = {
  host     : '37.60.254.213',
  user     : 'shopperu_school',
  password : 'password1',
  database : 'shopperu_schoolProject'
};

setBodyParserOptions(app);

app.all('/*', function(req, res, next) {
  var connection = constructConnection();
  var traffic = constructTraffic(req);

  var query = connection.query('INSERT INTO NetworkTraffic SET ?', traffic, function (error, results, fields) {
    setHeader(res);

    if (error) {
      console.log(error.message + '\n');
      res.send(error.message);
    } else {
      console.log('Traffic is inserted!\n');
      res.send('Traffic has been inserted!');
    }

    next();
  });

  connection.end();
});

app.listen(8080, function () {
  console.log('Service is listening on port 8080!')
});

/**
Private functions
*/

/// Misc
function constructConnection () {
  return mysql.createConnection(connectionConfig);
}

function setHeader (res) {
  res.set({
    'Content-Type': 'text/plain',
    status: 200
  })
}

/// Construct body parser
function setBodyParserOptions(app) {
  var options = {
    inflate: true,
    limit: '100kb',
    type: '*/*'
  };

  app.use(bodyParser.raw(options));
}

/// Construct triffic object
function constructTraffic (req) {
  return {
    client_ip: constructIP(req),
    request_url: req.protocol + '://' + req.get('host') + req.originalUrl,
    request_method: req.method,
    request_protocol: req.protocol,
    request_body: constructBody(req)
  };
}

function constructIP (req) {
  var clientIP;
  try {
    clientIP = req.headers['X-Forwarded-For'] || req.headers['x-forwarded-for'] || req.client.remoteAddress;
  } catch (error) {
    clientIP = 'unknown';
  }

  return clientIP;
}

function constructBody (req) {
  var body;
  try {
    if (req.method == 'GET') {
      body = '';
    } else {
      body = req.body.toString();
    }
  } catch (error) {
    body = 'unknown';
  }

  return body;
}
