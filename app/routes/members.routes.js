module.exports = (app) => {
    const members = require('../controllers/members.controller.js');

    /* Retrieve the members against the given github org. 
    *Members are returned based upon followers count descending.
    */
    app.get('/orgs/:org/members/', members.findMembers);

    /*Retrieve the members against the given github org.
    Members are returned based upon followers count descending.
    limit the number of members returned
    */
    app.get('/orgs/:org/members/:limit', members.findMembers);
}