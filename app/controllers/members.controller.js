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
async function getMembers(organization) {
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
  var res = await thirdPartyServices.callExternalUrl(options);
  orgMembersInformationList = [];
  if (res) {
    return Array.from(res);
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
  log.info("===uri===", uri);
  var options = {
    url: uri,
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    timeout: timeOut
  };
  var res = await thirdPartyServices.callExternalUrl(options);
  if (res) {
    log.debug("===Followers count========", Array.from(res).length);
    return Array.from(res).length;
  }
  return 0;
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
  var res = await thirdPartyServices.callExternalUrl(options);
  if (res) {
    return Array.from(res).length;
  }
  return 0;
}

function compare(a, b) {
  return Number(b['followers_count']) - Number(a['followers_count']);
}

exports.findMembers = async (req, res) => {

  var orgName = req.params.org;
  log.info(`==== Org: ${orgName} ===`);

  // Validate the empty org name. 
  if (!orgName) {
    log.debug("Invalid orgname received")
    return res.status(400).send({
      message: "org name can not be empty",
    });
  }

  // Validate that the input org is the valid github org, otherwise return.
  var githubOrgName = await thirdPartyServices.findOrg(orgName);

  if (githubOrgName.toLowerCase() !== orgName.toLowerCase()) {
    log.info(`Org: ${orgName} is not present in github`);
    return res.status(400).send({
      message: `Please enter a valid org. Given org: ${orgName} is not present at github`,
    });
  }

  var limit = 0

  if (req.params.limit) {
    limit = Number(req.params.limit);
  }

  orgMembersInformationList = [];

  var members = await getMembers(orgName);
  for (i = 0; i < members.length; i++) {
    //log.info(member.login, member.avatar_url, member.followers_url, member.following_url);
    orgMembersInformationList.push({
      'login': members[i].login,
      'avatar_url': members[i].avatar_url,
      'followers_count': await getFollowersCount(members[i].login),
      'following_url': await getFollowedByCount(members[i].login)
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
