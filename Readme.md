# Summary.
- RESTful Node js service wrapper for the given github organization members with given followers count.  
- Uses Node.js, express, axiom.

## List of API's and use cases:

** GET /orgs/:org/members **
   - Retrieves the list of all members against the given github organization.
   - Validates the org name first against github org.
   - If valid org, then retrieves the members for the org.
   - The members returned are sorted in descending order by followers count of the member.

** GET /orgs/:org/members/:limit **
   - Retrieves the list of all members against the given github organization.
   - Validates the org name first against github org.
   - If valid org, then retrieves the members for the org.
   - The members returned are sorted in descending order by followers count of the member.
   - The number of members to be returned can be limited by the :limit parameter.

** GET Http://localhost:<portnumber>
  - Returns all the endpoints implemented by the service.
 
## Additional Info
  - The app access the default public github api.
  - The time out parameter to github can be configured through app_config.json.

## prerequisites
- Configure the app_config.json for github api, timeout etc.
- App for now uses the github token to connect to github api. This needs to be configured under app_config.json under 'auth' section.
- The best and secure way to store, retrieve API keys in a environment is through HSM. storing through config is not the correct way of doing it. For demo purpose, we store it here.

## Setup Information

1. Install dependencies

```bash
npm install
```

2. Run the service

```bash
node app.js
```
