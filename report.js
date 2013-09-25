/*
 * Iterate through all screenshots made for the first environment, extract specific data
 * from file names and save them as report.json
 */

var fs = require('fs');
var utils = require('utils');
var config = require('config');

var report = {
    cacheBuster: (''+Math.random()).replace('0.',''),
    environments: config.environments,
    tasks: {

    }
}

try {
    var paths = eval("("+fs.read('paths.json')+')');
} catch(e) {
    paths = {};
}

for(var i in config.environments) {
    var env = i;
    break;
}
var files =  fs.list(env);

for(var i=0; i < files.length; i++) {
    var filename = String(files[i]);

    var matches = /(\d+)_(\d+x\d+)(_(.[a-z]+))?_(.*)\./.exec(filename);

    if(!utils.isArray(matches))
        continue;

    var name = matches[5],viewport = matches[2],media = matches[4],diff = matches[1];

    if(!report.tasks.hasOwnProperty(name))
        report.tasks[name] = {
            variants: []
        };


    if(typeof(media) == 'undefined' || media == 'null')
        media = null;

    var found = false;
    for(var j=0; j < report.tasks[name].variants.length; j++) {
        var variant = report.tasks[name].variants[j];

        if(variant.viewportSize == viewport && variant.media == media) {
            found = true;
            break;
        }
    }

    if(!found) {
        report.tasks[name].variants.push({
            viewportSize: viewport,
            media: media,
            diff: diff,
            path: paths[name]
        });
    }
}

fs.write('report.json',JSON.stringify(report),'w');
phantom.exit();
