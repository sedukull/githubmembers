const thirdPartyServices = require('../modules/thirdpartyservices');
const log = require('loglevel');
const appConfig = require('../../config/app_config');
const util = require('util');
require('dotenv').config()

const environment = process.env.NODE_ENV || 'development';

log.setDefaultLevel(log.levels.INFO);

/**
 * Retrieves the members of a given github organization.
 * @param {*} organization 
 */
const getMembers = async (organization) => {
  var baseUrl = appConfig[environment].github_base_url;
  var timeOut = appConfig[environment].time_out;
  var uri = util.format("%s/orgs/%s/members", baseUrl, organization);
  log.debug(uri);
  var options = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    timeout: timeOut
  };
  options = thirdPartyServices.addAuthHeader(options);
  try {
    var res = await thirdPartyServices.callExternalUrl(options);
    if (res) {
      return Array.from(res);
    }
  } catch (err) {
    throw err;
  }
};

/**
 * Retrieves the followers count of a given github user.
 * @param {*} login 
 */
const getFollowersCount = async (login) => {
  var baseUrl = appConfig[environment].github_base_url;
  var timeOut = appConfig[environment].time_out;
  var uri = util.format("%s/users/%s/followers", baseUrl, login);
  log.debug("===uri===", uri);
  var options = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    timeout: timeOut
  };
  options = thirdPartyServices.addAuthHeader(options);

  try {
    var res = await thirdPartyServices.callExternalUrl(options);
    if (res) {
      let len = Array.from(res).length;
      log.debug(util.format("======= Login: %s. Followers Count: %s ====", login, len));
      return len;
    }
  } catch (err) {
    return 0;
  }
}

/**
 * Retrieves the github member followed by count. 
 * @param {*} login 
 */
const getFollowedByCount = async (login) => {
  var baseUrl = appConfig[environment].github_base_url;
  var timeOut = appConfig[environment].time_out;
  var uri = util.format("%s/users/%s/following", baseUrl, login);
  log.debug(uri);
  var options = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    timeout: timeOut
  };
  options = thirdPartyServices.addAuthHeader(options);
  
  try {
    var res = await thirdPartyServices.callExternalUrl(options);
    if (res) {
      var len = Array.from(res).length;
      log.debug(util.format("======= Login: %s. Following count: %s ====", login, len));
      return len;
    }
  } catch (err) {
    return 0;
  }
}

function compare(a, b) {
  return Number(b['followers_count']) - Number(a['followers_count']);
}

/**
 * Retrieves the members of given github organization, sorted descending by followers count.
 */
exports.findMembers = async (req, res) => {

  var orgName = req.params.org;
  log.info(`==== Input org: ${orgName} ===`);

  // Validate the empty org name. 
  if (!orgName) {
    log.warn("Invalid orgname received");
    return res.status(400).send({
      message: "org name can not be empty",
    });
  }

  // Validate that the input org is the valid github org, otherwise throw err.
  try {
    var githubOrgName = await thirdPartyServices.findOrg(orgName);
    log.info("====github orgname", githubOrgName);
    if (githubOrgName.toLowerCase() !== orgName.toLowerCase()) {
      log.info(`Org: ${orgName} is not present in github`);
      return res.status(400).send({
        message: `Please enter a valid org. Given org: ${orgName} is not present at github`,
      });
    }
  } catch (err) {
    log.error(err);
    return res.status(500).send({
      message: `Unable to fetch the org: ${orgName} information. Please check again.`,
    });
  }

  var limit = 0

  if (req.params.limit) {
    limit = Number(req.params.limit);
  }

  orgMembersInformationList = [];

  var members = [];
  try {
    members = await getMembers(orgName);
  } catch (err) {
    return res.status(500).send({
      message: `Issue retrieving org members for org: ${orgName}. Please try again`,
    });
  }
  for (i = 0; i < members.length; i++) {
    log.debug(members[i].login, members[i].avatar_url, members[i].followers_url, members[i].following_url);
    orgMembersInformationList.push({
      'login': members[i].login,
      'avatar_url': members[i].avatar_url,
      'followers_count': await getFollowersCount(members[i].login),
      'following_count': await getFollowedByCount(members[i].login)
    }
    )
    if (limit !== 0 && limit === orgMembersInformationList.length) {
      break;
    }
  }
  log.debug("number of members limited:", limit, orgMembersInformationList);
  orgMembersInformationList.sort(compare);
  return res.send(orgMembersInformationList);
}
