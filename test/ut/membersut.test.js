const expect = require('chai').expect;
const sinon = require('sinon');
const memberController = require('../../app/controllers/members.controller')
const thirdpartyServices = require('../../app/modules/thirdpartyservices')
const mockHttpReq = require('node-mocks-http')

const mockRequest = (orgName) => {
    return {
        params: {'org': orgName },
    };
};

var mockResponse = mockHttpReq.createResponse();

describe('findMembers() Test', () => {

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('invalid org name test', async() =>  {
        sandbox.stub(thirdpartyServices, 'callExternalUrl').returns({});
        var res = await memberController.findMembers(mockRequest(''), mockResponse);
        expect(res.statusCode).to.equal(400);
    });

    it('valid org name test', async ()=> {
        var req = mockRequest('xendit');
        var callExternalUrlStub = sandbox.stub(thirdpartyServices, 'callExternalUrl').returns({name: 'xendit'});
        var findOrgSpy = sandbox.spy(thirdpartyServices, 'findOrg');
        await memberController.findMembers(req, mockResponse);
        expect(findOrgSpy.calledOnce).to.be.true;
        expect(findOrgSpy.getCalls()[0].args[0]).to.equal('xendit');
    });

    it('validate external url throws exception', async () => {
        var req = mockRequest('xendit');
        sandbox.stub(thirdpartyServices, 'callExternalUrl').throws();
        var response = await memberController.findMembers(req, mockResponse);
        expect(response.statusCode).to.equal(500);
    });

    it('validate external url returns valid response', async () => {
        var req = mockRequest('xendit');
        var jsonResponse = [{
          'login': 'abc',
          'avatar_url': 'dummy url',
          'followers_url': 'dummy followers url',
          'following_url': 'dummy following url',
          'name': 'xendit'
        }]
        sandbox.stub(thirdpartyServices, 'callExternalUrl').returns(jsonResponse);
        sandbox.stub(thirdpartyServices, 'findOrg').returns('xendit');
        var response = await memberController.findMembers(req, mockResponse);
        expect(response.statusCode).to.equal(500);
    });
})
