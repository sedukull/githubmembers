/**
 * Third party module to integrate with github api.
 */
const httpLibrary = require("axios")
const log = require('loglevel')
const appConfig = require('../../config/app_config')
const util = require("util")
require('dotenv').config()

log.setDefaultLevel(log.levels.INFO);

const environment = process.env.NODE_ENV || 'development';

exports.addAuthHeader = (options) => {
  var headers = options.headers;
  if (appConfig[environment]['auth']['use_auth_token']) {
    headers['Authorization'] = util.format('token %s', appConfig[environment]['auth']['token']);
  }
  options.headers = headers;
  return options;
};

/**
 * retrieves the github organization with a given name.
 */
exports.findOrg = async (orgName) => {
  var timeOut = appConfig[environment].time_out;
  var baseUrl = appConfig[environment].github_base_url;
  var uri = util.format("%s/orgs/%s", baseUrl, orgName);

  log.info(`=== Url: ${uri}. Org Name: ${orgName} ====`);
 
  var options = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    timeout: timeOut
  };

  options = this.addAuthHeader(options);
  
  try {
    var res = await this.callExternalUrl(options);
    return res.name;
  } catch (err) {
    throw err;   
  }
};

/**
 * Makes an external call. EX: To github with given url and option parameters.
 */
exports.callExternalUrl = async (options) => {
  log.debug(options.url)
  return httpLibrary(options).then(res => { return res.data }).catch(err => {log.error(err); throw err;});
};