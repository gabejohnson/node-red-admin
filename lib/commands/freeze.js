var request = require("../request"),
    fs = require('fs');

function command(argv,result) {
    return request.request('/nodes', {})
        .then(nodesetsToDisabledConfig)
        .catch(function(err) {
            throw err;
        })
        .done(function(json) {
            fs.writeFile(argv._[1], json, function(err) {
                if(err) {
                    throw err;
                }
            });
        });
}

command.name = "freeze";
command.usage = "freeze [output file]";
command.description = "Writes current disabled state of installed nodes to the specified file";

module.exports = command;

function nodesetsToDisabledConfig(list) {
    var obj = list.reduce(function(acc, nodeset) {
        var module = nodeset.id.split('/')[0];
        if(!(module in acc)) {
            acc[module] = {};
        }
        acc[module][nodeset.name] = !nodeset.enabled;
        return acc;
    }, {});

    for(var moduleName in obj) {
        if(obj.hasOwnProperty(moduleName)) {
            var module = obj[moduleName],
            disabledList = [];
            for(var nodeset in module) {
                if(module.hasOwnProperty(nodeset) && module[nodeset] === true) {
                    disabledList.push(nodeset);
                }
            }
            if(disabledList.length === Object.keys(module).length) {
                obj[moduleName] = true;
            } else if(disabledList.length > 0) {
                obj[moduleName] = disabledList;
            } else {
                obj[moduleName] = false;
            }
        }
    }
    return JSON.stringify(obj, null, '  ');
}
