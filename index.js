var Pediff = require('./lib/pediff.js'),
    parseConfig = require('./lib/config.js'),
    config = require('./config.js'),
    instance;

// TODO: start a live websockets server if live option is set
// TODO: command line configuration
// TODO: load pediff.js as config file by default
// TODO: running individual specs from command line

var defaults = {
    port: 5000,
    specDir: 'spec',
    resultsDir: 'results',
    parallelLimit: 18,
    debug: false
};

config = parseConfig(config, defaults);

instance = new Pediff(config);
instance.runAll();
