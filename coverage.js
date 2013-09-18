/*
 * Iterate through all routes defined in configuration, and check whether they are tested,
 * based on the paths in tasks options.
 */

require('./coverage/route');
require('./coverage/routeVariant');
require('./coverage/test');

var fs = require('fs');
var utils = require('utils');
var pediffConfig = require('./config');

var coverageConfig = pediffConfig.coverage;

if(coverageConfig !== false) {
    //collect routes
    var routesJSON = eval("("+fs.read(coverageConfig.routes)+')');
    var routes = [];
    for(var i=0;i<routesJSON.length;i++) {
        routes.push(new Route(routesJSON[i].path.replace(/\(\/:/g,'/(:'),routesJSON[i].name));
    }

    //collect tasks
    var taskFiles = fs.list('tasks');
    var tasks = [];
    var tasksOptions = pediffConfig.options;

    for(var i=0;i<taskFiles.length;i++) {
        var filename = taskFiles[i];

        try {
            var task = require('./tasks/'+filename);
        } catch(e) { continue; }

        var config = {};
        utils.mergeObjects(config,tasksOptions);
        utils.mergeObjects(config,task.config);

        var media = [];
        for(var j=0;j<config.viewportSize.length;j++) {
            media.push(config.viewportSize[j].width+'x'+config.viewportSize[j].height);
        }
        for(var key in config.media) {
            if(config.media[key])
                media.push(key);
        }

        var path = (typeof(config.path) !== 'undefined') ? config.path : '';

        tasks.push(new Test(path.replace('#!/',''),media,filename));
    }

    //test routes
    for(var i=0;i<routes.length;i++) {
        routes[i].test(tasks);
    }
} else {
    routes = false;
}

var report = eval("("+fs.read('report.json')+')');
report.coverage = routes;

fs.write('report.json',JSON.stringify(report),'w');

phantom.exit();
