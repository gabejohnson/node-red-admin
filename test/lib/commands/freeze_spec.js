var command = require("../../../lib/commands/freeze");

var should = require("should");
var sinon = require("sinon");
var when = require("when");

var request = require("../../../lib/request");
var result = require("./result_helper");
var fs = require('fs');

describe("commands/freeze", function() {
    afterEach(function() {
        request.request.restore();
        fs.writeFile.restore();
    });

    it('write json to file', function(done) {
        var error;
        sinon.stub(request,"request",function(path,opts) {
            try {
                should(path).be.eql("/nodes");
                opts.should.eql({});
            } catch(err) {
                error = err;
            }
            return when.resolve([{
                id: "node-red-mock-module1/mock-nodeset1",
                name: "mock-nodeset1",
                enabled: true
            },{
                id: "node-red-mock-module1/mock-nodeset2",
                name: "mock-nodeset2",
                enabled: false
            },{
                id: "node-red-mock-module2/mock-nodeset1",
                name: "mock-nodeset1",
                enabled: true
            },{
                id: "node-red-mock-module2/mock-nodeset2",
                name: "mock-nodeset2",
                enabled: true
            },{
                id: "node-red-mock-module3/mock-nodeset1",
                name: "mock-nodeset1",
                enabled: false
            },{
                id: "node-red-mock-module3/mock-nodeset2",
                name: "mock-nodeset2",
                enabled: false
            }]);
        });
        sinon.stub(fs,"writeFile",function(path,data,cb) {
            var disabledConfig = JSON.parse(data);
            disabledConfig.should.have.property("node-red-mock-module1").and.containDeep(['mock-nodeset2']);
            disabledConfig.should.have.property("node-red-mock-module2").and.be.false;
            disabledConfig.should.have.property("node-red-mock-module3").and.be.true;
            done();
        });
        command({_:["freeze","disabled.json"]});
    });
});
