var _ = require('lodash'),
    events = events = require('events'),
    Spooky = require('spooky'),
    getPort = require('get-port');

var instance;

var Browser = function() {
};

Browser.prototype = _.extend({
    spawn: function(options) {
        getPort(function(err, port) {
            var config = {
                child: {
                    transport: 'http',
                    port: port
                },
                casper: _.extend({
                    logLevel: 'error',
                    verbose: false,
                    pageSettings: {
                        loadImages: true
                    },
                    onDie: function() {
                        this.emit('casper:die', arguments);
                    },
                    onError: function() {
                        this.emit('casper:error', arguments);
                    }
                }, options.casperOptions)
            };

            var spooky = new Spooky(config, function(err) {
                options.onReady(err, spooky);
                spooky.run(function() {
                    this.emit('done');
                });
            });

            spooky.on('error', function(error, stack) {
                this.emit('spooky:error', arguments);
            }.bind(this));

            spooky.on('console', function(line) {
                this.emit('spooky:console', line);
            }.bind(this));

            spooky.on('log', function(log) {
                if(log.space === 'spooky.server' && log.message.code === 400) {
                    spooky.emit('spooky:error', JSON.parse(log.message.body).error.message.replace(/ \- .*/, '') + '(possible ports conflict)');
                }
                if(log.space === 'phantom' && log.level === 'error') {
                    spooky.emit('phantom:error', log.message.replace(/ \- .*/, ''));
                }
                if(log.space === 'remote') {
                    this.emit('spooky:log', log.message.replace(/ \- .*/, ''));
                }
            }.bind(this));

            spooky.once('done', function() {
                this.emit('spooky:destroy');
                spooky.destroy();
            }.bind(this));

            options.onSpawn(spooky);
        }.bind(this));
    }
}, events.EventEmitter.prototype);

module.exports = function() {
    if(!instance) {
        instance = new Browser();
    }
    return instance;
}();
