const express = require('express');
const bodyParser = require('body-parser');
const log = require('loglevel')
const allRoutes = require('express-list-endpoints');
const appConfig = require('./config/app_config')
require('dotenv').config()


log.setDefaultLevel(log.levels.INFO);

const environment = process.env.NODE_ENV || 'development';
const servicePort = appConfig[environment].port;

log.info(`==== Environment Information: ${environment} ====`)

// create express app
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

// define a simple route
app.get('/', (req, res) => {
  res.json(allRoutes(app))
});

require('./app/routes/members.routes.js')(app);

// listen for requests
var server = app.listen(servicePort, () => {
  log.info(`Service started. Port: ${servicePort}`);
});

module.exports = server;