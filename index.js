var Pediff = require('./lib/pediff.js'),
    Server = require('./lib/server.js'),
    parseConfig = require('./lib/config.js'),
    config = require('./config.js'),
    instance;

// TODO: command line configuration
// TODO: load pediff.js as config file by default
// TODO: running individual specs from command line

var defaults = {
    port: 5000,
    specDir: 'spec',
    resultsDir: 'results',
    parallelLimit: 18,
    debug: false,
    live: false
};

config = parseConfig(config, defaults);

instance = new Pediff(config);

if(config.live) {
    new Server(config, instance);
} else {
    instance.runAll();
}
