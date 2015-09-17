var _ = require('lodash'),
    path = require('path');

var absolutePath = function(dir) {
    if(dir.indexOf(path.sep) !== dir.length - 1) {
        dir += path.sep;
    }
    if(dir.indexOf(process.cwd()) !== -1) {
        return dir;
    }
    return path.join(process.cwd(), dir);
};

var parse = function(config, defaults) {
    config = _.defaults(config, defaults);

    config.specDir = absolutePath(config.specDir);
    config.resultsDir = absolutePath(config.resultsDir);

    return config;
};

module.exports = parse;
