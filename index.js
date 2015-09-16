#!/usr/bin/env node

var Pediff = require('./lib/pediff.js'),
    Server = require('./lib/server.js'),
    parseConfig = require('./lib/config.js'),
    meow = require('meow'),
    path = require('path'),
    config,
    instance;

var defaults = {
    specDir: 'spec',
    resultsDir: 'results',
    parallelLimit: 18,
    live: false
};

var cli = meow({
    help: [
        'Usage',
        '  pediff [options] run all',
        '  pediff [options] run <spec>[ <spec2> <spec...> ]',
        '',
        'Options',
        //'  --live          - runs a webserver for dynamic testing',
        '  --config <path> - tells pediff where to look for a configuration file (by default it\'s pediff.js in root directory)',
        '  --debug         - outputs additional information'
    ]
});

if(!cli.input.length && !cli.flags.live || cli.input[0] !== 'run' || !cli.input[1]) {
    cli.showHelp();
    process.exit(0);
}

try {
    if(cli.flags.config) {
        config = require(path.join(process.cwd(), cli.flags.config));
    } else {
        config = require(path.join(process.cwd(), 'pediff.js'));
    }
} catch (e) {
    if(cli.flags.config) {
        console.error('  Configuration file ' + cli.flags.config + ' not found.');
    } else {
        console.error('  Configuration file pediff.js not found.\n  Please create this file in the root directory, or tell us where to find it with the --config option.');
    }
    process.exit(0);
}

config = parseConfig(config, defaults);

config.debug = !!cli.flags.debug;

instance = new Pediff(config);

//if(cli.flags.live) {
//    new Server(config, instance);
//} else {
    if(cli.input[1] === 'all') {
        instance.runAll();
    } else {
        var specs = cli.input.splice(1, cli.input.length - 1);
        instance.runBundle(specs);
    }
//}
