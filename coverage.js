/*
 * Iterate through all routes defined in configuration, and check whether they are tested,
 * based on the paths in tasks options.
 */

require('./coverage/route');
require('./coverage/routeVariant');
require('./coverage/test');


// Good to know that PhantomJS, so Casper too,
// uses own fs module, not Node fs
var fs = require('fs'),
    utils = require('utils'),
    pediffConfig = require('./config'),

    coverageConfig = pediffConfig.coverage;

if(coverageConfig !== false) {
    //collect routes
    var routesJSON = JSON.parse(fs.read(coverageConfig.routes).replace(/\n|\r/g, ""));

    var routes = routesJSON.map(function(route) {
        return new Route(route.path.replace(/\(\/:/g,'/(:'), route.name);
    });

    //collect tasks
    var taskFiles = fs.list('tasks'),
        tasks = [],
        tasksOptions = pediffConfig.options;


    tasks = taskFiles.map(function(filename) {
        var task, config = {}, mediaKeys;

        try {
            task = require('./tasks/'+filename)
        } catch (e) {
            return void 0
        };

        utils.mergeObjects(config, tasksOptions);
        utils.mergeObjects(config, task.config);


        mediaKeys = Object.keys(config.media)
            .filter(function(key) {
                return config.media[key];
            });

        media = config.viewportSize
            .map(function(size) {
                return size.width + 'x' + size.height;
            })
            .concat(mediaKeys);

        var path = (typeof(config.path) !== 'undefined') ? config.path : '';

        // filename
        return new Test(path.replace('#!/',''), media, filename);
    })
    // null/undefined filter
    .filter(function(x) { return x });

    // test routes
    routes.forEach(function(route) {
        route.test(tasks);
    });
} else {
    routes = false;
}

var report = JSON.parse(fs.read('report.json').replace(/\n|\r/g, ""));

report.coverage = routes;

fs.write('report.json', JSON.stringify(report), 'w');

phantom.exit();
